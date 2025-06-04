import {
  FC,
  useState,
  useRef,
  DragEvent,
  useEffect,
  KeyboardEvent,
  ChangeEvent,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { ConvertToBase64, OptimizeBase64Image } from "@/lib/imageUtils";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useSession } from "next-auth/react";
import { Permission } from "@/types/permissions";
import { HasPermission } from "@/lib/permissions";
import { useToast } from "@/app/context/ToastContext";

type Slide = {
  Id: string;
  Name: string;
  ImageData: string;
  Duration: number;
  CreatedAt?: string;
  UpdatedAt?: string;
};

type SlajdyProps = {};

const Slajdy: FC<SlajdyProps> = () => {
  const { data: _Session } = useSession();
  const [_Slides, SetSlides] = useState<Slide[]>([]);
  const [SelectedSlide, SetSelectedSlide] = useState<Slide | null>(null);
  const FileInputRef = useRef<HTMLInputElement>(null);
  const SlideContainerRef = useRef<HTMLDivElement>(null);
  const [IsDragging, SetIsDragging] = useState(false);
  const [IsLoading, SetIsLoading] = useState(false);
  const [DeletingSlideId, SetDeletingSlideId] = useState<string | null>(null);
  const [IsConfirmModalOpen, SetIsConfirmModalOpen] = useState(false);
  const [SlideToDelete, SetSlideToDelete] = useState<string | null>(null);
  const [DraggedSlide, SetDraggedSlide] = useState<string | null>(null);
  const [DragOverSlide, SetDragOverSlide] = useState<string | null>(null);
  const [DragPosition, SetDragPosition] = useState<"above" | "below" | null>(
    null,
  );
  const [IsEditingName, SetIsEditingName] = useState(false);
  const [EditedName, SetEditedName] = useState("");
  const NameInputRef = useRef<HTMLInputElement>(null);
  const { ShowToast } = useToast();

  const UserPermissions = _Session?.user?.permissions || 0;
  const CanViewSlides = HasPermission(UserPermissions, 1 << 1); // SLIDES_VIEW
  const CanEditSlides = HasPermission(UserPermissions, 1 << 2); // SLIDES_EDIT

  useEffect(() => {
    FetchSlides();
  }, [_Session]);

  const FetchSlides = async () => {
    try {
      SetIsLoading(true);

      const Response = await fetch("/api/slides");

      if (!Response.ok) {
        if (Response.status === 403) {
          ShowToast("Nie masz uprawnień do przeglądania slajdów", "error");
        } else {
          ShowToast(
            `Błąd podczas wczytywania slajdów: ${Response.status}`,
            "error",
          );
        }
        SetSlides([]);
        return;
      }

      const Data = await Response.json();

      if (Data && Array.isArray(Data.Slides)) {
        SetSlides(Data.Slides);
        if (Data.Slides.length > 0 && !SelectedSlide) {
          SetSelectedSlide(Data.Slides[0]);
        }
      } else {
        console.error("Unexpected data format:", Data);
        ShowToast("Otrzymano nieprawidłowy format danych", "error");
        SetSlides([]);
      }
    } catch (Error: any) {
      console.error("Failed to fetch slides:", Error);
      ShowToast("Błąd podczas wczytywania slajdów", "error");
      SetSlides([]);
    } finally {
      SetIsLoading(false);
    }
  };

  const HandleFileUpload = async (Files: FileList | null) => {
    if (!Files || Files.length === 0) return;
    if (!CanEditSlides) {
      ShowToast("Nie masz uprawnień do edycji slajdów", "error");
      return;
    }

    SetIsLoading(true);

    try {
      const UploadPromises = Array.from(Files).map(async (File) => {
        const Base64Data = await ConvertToBase64(File);
        const OptimizedImage = await OptimizeBase64Image(Base64Data);

        const Response = await fetch("/api/slides", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Name: File.name,
            ImageData: OptimizedImage,
            Duration: 5,
          }),
        });

        if (!Response.ok) {
          if (Response.status === 403) {
            throw new Error("Nie masz uprawnień do dodawania slajdów");
          }
          throw new Error(`Błąd podczas dodawania slajdu: ${Response.status}`);
        }

        return await Response.json();
      });

      await Promise.all(UploadPromises);
      await FetchSlides();
      ShowToast("Slajdy zostały dodane pomyślnie", "success");
    } catch (Error: any) {
      console.error("Error uploading slides:", Error);
      ShowToast(Error.message || "Błąd podczas dodawania slajdów", "error");
    } finally {
      SetIsLoading(false);
    }
  };

  const HandleDragOver = (Event: DragEvent<HTMLDivElement>) => {
    Event.preventDefault();
    SetIsDragging(true);
  };

  const HandleDragLeave = (Event: DragEvent<HTMLDivElement>) => {
    Event.preventDefault();
    SetIsDragging(false);
  };

  const HandleDrop = (Event: DragEvent<HTMLDivElement>) => {
    Event.preventDefault();
    SetIsDragging(false);
    HandleFileUpload(Event.dataTransfer.files);
  };

  const RequestRemoveSlide = (Id: string) => {
    if (!Id) return;
    if (!CanEditSlides) {
      ShowToast("Nie masz uprawnień do usuwania slajdów", "error");
      return;
    }
    SetSlideToDelete(Id);
    SetIsConfirmModalOpen(true);
  };

  const HandleRemoveSlide = async () => {
    if (!SlideToDelete) return;
    if (!CanEditSlides) {
      ShowToast("Nie masz uprawnień do usuwania slajdów", "error");
      return;
    }

    SetIsConfirmModalOpen(false);

    try {
      SetIsLoading(true);

      if (SlideToDelete === "all") {
        const SlidesToDelete = [..._Slides];
        let Success = true;

        SetSelectedSlide(null);
        SetDeletingSlideId("all");

        const RemainingSlides = [...SlidesToDelete];
        SetSlides(RemainingSlides);

        for (let i = 0; i < SlidesToDelete.length; i++) {
          const CurrentSlide = SlidesToDelete[i];

          try {
            if (i < SlidesToDelete.length - 1) {
              RemainingSlides.pop();
              SetSlides([...RemainingSlides]);

              await new Promise((resolve) => setTimeout(resolve, 50));
            }

            const DeleteResponse = await fetch(
              `/api/slides/${CurrentSlide.Id}`,
              {
                method: "DELETE",
              },
            );

            if (!DeleteResponse.ok) {
              if (DeleteResponse.status === 403) {
                throw new Error("Nie masz uprawnień do usuwania slajdów");
              }
              throw new Error(
                `Błąd podczas usuwania slajdu: ${DeleteResponse.status}`,
              );
            }
          } catch (Error: any) {
            console.error(`Failed to delete slide ${CurrentSlide.Id}:`, Error);
            ShowToast(
              Error.message || "Błąd podczas usuwania slajdów",
              "error",
            );
            Success = false;
            break;
          }
        }

        if (Success) {
          SetSlides([]);
          ShowToast("Wszystkie slajdy zostały usunięte", "success");
        }
      } else {
        SetDeletingSlideId(SlideToDelete);

        try {
          const DeleteResponse = await fetch(`/api/slides/${SlideToDelete}`, {
            method: "DELETE",
          });

          if (!DeleteResponse.ok) {
            if (DeleteResponse.status === 403) {
              throw new Error("Nie masz uprawnień do usuwania slajdów");
            }
            throw new Error(
              `Błąd podczas usuwania slajdu: ${DeleteResponse.status}`,
            );
          }

          const NewSlides = _Slides.filter(
            (Slide) => Slide.Id !== SlideToDelete,
          );
          SetSlides(NewSlides);

          if (SelectedSlide && SelectedSlide.Id === SlideToDelete) {
            SetSelectedSlide(NewSlides[0] || null);
          }

          setTimeout(() => {
            if (SlideContainerRef.current) {
              SlideContainerRef.current.focus();
            }
          }, 50);

          ShowToast("Slajd został usunięty", "success");
        } catch (Error: any) {
          console.error("Error removing slide:", Error);
          ShowToast(Error.message || "Błąd podczas usuwania slajdu", "error");
        }
      }
    } catch (Error: any) {
      console.error("Error removing slide:", Error);
      ShowToast(Error.message || "Błąd podczas usuwania slajdów", "error");
    } finally {
      SetIsLoading(false);
      SetDeletingSlideId(null);
      SetSlideToDelete(null);
    }
  };

  const HandleDurationChange = async (Id: string, Duration: number) => {
    if (!CanEditSlides) {
      ShowToast("Nie masz uprawnień do edycji slajdów", "error");
      return;
    }

    try {
      const SlideToUpdate = _Slides.find((Slide) => Slide.Id === Id);
      if (!SlideToUpdate) return;

      const UpdatedSlide = { ...SlideToUpdate, Duration };

      const UpdateResponse = await fetch(`/api/slides/${Id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: UpdatedSlide.Name,
          ImageData: UpdatedSlide.ImageData,
          Duration: UpdatedSlide.Duration,
        }),
      });

      if (!UpdateResponse.ok) {
        if (UpdateResponse.status === 403) {
          throw new Error("Nie masz uprawnień do edycji slajdów");
        }
        throw new Error(`Błąd podczas aktualizacji: ${UpdateResponse.status}`);
      }

      const NewSlides = _Slides.map((Slide) =>
        Slide.Id === Id ? UpdatedSlide : Slide,
      );

      SetSlides(NewSlides);

      if (SelectedSlide && SelectedSlide.Id === Id) {
        SetSelectedSlide(UpdatedSlide);
      }

      ShowToast("Czas wyświetlania został zaktualizowany", "success");
    } catch (Error: any) {
      console.error("Error updating slide duration:", Error);
      ShowToast(
        Error.message || "Błąd podczas aktualizacji czasu wyświetlania",
        "error",
      );
    }
  };

  const HandleDownload = (ImageData: string, Name: string) => {
    const Link = document.createElement("a");
    Link.href = ImageData;
    Link.download = Name;
    document.body.appendChild(Link);
    Link.click();
    document.body.removeChild(Link);
  };

  const HandleDragStart = (Id: string) => {
    if (!CanEditSlides) return;
    SetDraggedSlide(Id);
  };

  const HandleDragEnd = () => {
    SetDraggedSlide(null);
    SetDragOverSlide(null);
    SetDragPosition(null);
  };

  const HandleDragOverSlide = (
    Id: string,
    Event: React.DragEvent<HTMLDivElement>,
  ) => {
    if (DraggedSlide === Id) return;

    const TargetRect = Event.currentTarget.getBoundingClientRect();
    const MouseY = Event.clientY;
    const RelativePosition = MouseY - TargetRect.top;

    if (RelativePosition < TargetRect.height / 2) {
      SetDragPosition("above");
    } else {
      SetDragPosition("below");
    }

    SetDragOverSlide(Id);
  };

  const HandleDropOnSlide = async () => {
    if (
      !DraggedSlide ||
      !DragOverSlide ||
      DraggedSlide === DragOverSlide ||
      DeletingSlideId
    ) {
      SetDraggedSlide(null);
      SetDragOverSlide(null);
      SetDragPosition(null);
      return;
    }

    if (!CanEditSlides) {
      ShowToast("Nie masz uprawnień do edycji slajdów", "error");
      SetDraggedSlide(null);
      SetDragOverSlide(null);
      SetDragPosition(null);
      return;
    }

    const DraggedIndex = _Slides.findIndex(
      (slide) => slide.Id === DraggedSlide,
    );
    const DropIndex = _Slides.findIndex((slide) => slide.Id === DragOverSlide);

    if (DraggedIndex === -1 || DropIndex === -1) return;

    const NewSlides = [..._Slides];
    const [DraggedItem] = NewSlides.splice(DraggedIndex, 1);

    const FinalDropIndex = DragPosition === "below" ? DropIndex + 1 : DropIndex;
    NewSlides.splice(
      FinalDropIndex > DraggedIndex ? FinalDropIndex - 1 : FinalDropIndex,
      0,
      DraggedItem,
    );

    SetSlides(NewSlides);

    if (SelectedSlide && SelectedSlide.Id === DraggedSlide) {
      SetSelectedSlide(DraggedItem);
    }

    SetDraggedSlide(null);
    SetDragOverSlide(null);
    SetDragPosition(null);
  };

  const HandleKeyDown = (Event: KeyboardEvent<HTMLDivElement>, Id: string) => {
    if (
      (Event.key === "Delete" || Event.key === "Backspace") &&
      !DeletingSlideId
    ) {
      Event.preventDefault();
      Event.stopPropagation();
      RequestRemoveSlide(Id);
    }
  };

  const HandleContainerKeyDown = (Event: KeyboardEvent<HTMLDivElement>) => {
    if (
      (Event.key === "Delete" || Event.key === "Backspace") &&
      SelectedSlide &&
      !DeletingSlideId
    ) {
      Event.preventDefault();
      RequestRemoveSlide(SelectedSlide.Id);
    }
  };

  useEffect(() => {
    const HandleGlobalKeyDown = (Event: globalThis.KeyboardEvent) => {
      if (
        (Event.key === "Delete" || Event.key === "Backspace") &&
        SelectedSlide &&
        !DeletingSlideId &&
        document.activeElement === SlideContainerRef.current
      ) {
        Event.preventDefault();
        RequestRemoveSlide(SelectedSlide.Id);
      }
    };

    window.addEventListener("keydown", HandleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", HandleGlobalKeyDown);
    };
  }, [SelectedSlide, DeletingSlideId]);

  const GetFileNameWithoutExtension = (FileName: string) => {
    return FileName.replace(/\.[^/.]+$/, "");
  };

  const GetFileExtension = (FileName: string) => {
    const Match = FileName.match(/\.[^/.]+$/);
    return Match ? Match[0] : "";
  };

  const HandleNameEdit = (Id: string) => {
    if (!CanEditSlides) {
      ShowToast("Nie masz uprawnień do edycji slajdów", "error");
      return;
    }

    const SlideToEdit = _Slides.find((Slide) => Slide.Id === Id);
    if (!SlideToEdit) return;

    SetEditedName(GetFileNameWithoutExtension(SlideToEdit.Name));
    SetIsEditingName(true);

    setTimeout(() => {
      if (NameInputRef.current) {
        NameInputRef.current.focus();
        NameInputRef.current.select();
      }
    }, 50);
  };

  const HandleNameChange = (Event: ChangeEvent<HTMLInputElement>) => {
    SetEditedName(Event.target.value);
  };

  const HandleNameSave = async () => {
    if (!SelectedSlide) return;
    if (!CanEditSlides) {
      ShowToast("Nie masz uprawnień do edycji slajdów", "error");
      SetIsEditingName(false);
      return;
    }

    SetIsEditingName(false);

    if (EditedName.trim() === "") return;

    try {
      const FileExtension = GetFileExtension(SelectedSlide.Name);
      const NewName = EditedName.trim() + FileExtension;

      if (NewName === SelectedSlide.Name) return;

      const UpdatedSlide = { ...SelectedSlide, Name: NewName };

      const UpdateResponse = await fetch(`/api/slides/${SelectedSlide.Id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Name: UpdatedSlide.Name,
          ImageData: UpdatedSlide.ImageData,
          Duration: UpdatedSlide.Duration,
        }),
      });

      if (!UpdateResponse.ok) {
        if (UpdateResponse.status === 403) {
          throw new Error("Nie masz uprawnień do edycji slajdów");
        }
        throw new Error(`Błąd podczas aktualizacji: ${UpdateResponse.status}`);
      }

      const NewSlides = _Slides.map((Slide) =>
        Slide.Id === SelectedSlide.Id ? UpdatedSlide : Slide,
      );

      SetSlides(NewSlides);
      SetSelectedSlide(UpdatedSlide);
      ShowToast("Nazwa slajdu została zaktualizowana", "success");
    } catch (Error: any) {
      console.error("Error updating slide name:", Error);
      ShowToast(
        Error.message || "Błąd podczas aktualizacji nazwy slajdu",
        "error",
      );
    }
  };

  const HandleNameKeyDown = (Event: KeyboardEvent<HTMLInputElement>) => {
    if (Event.key === "Enter") {
      HandleNameSave();
    } else if (Event.key === "Escape") {
      SetIsEditingName(false);
    }
  };

  return (
    <div className="relative p-0 rounded-2xl overflow-hidden h-[calc(100vh-10rem)] max-w-full">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-rose-950/40 z-0"></div>
      <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-repeat opacity-10 z-0"></div>

      <div className="relative z-10 h-full flex flex-col">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-rose-500/20">
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-2xl font-bold text-transparent text-white flex items-center"
          >
            <i className="fas fa-layer-group text-rose-400 mr-3 text-2xl"></i>
            Zarządzanie slajdami
          </motion.h3>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex gap-2"
          >
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => HandleFileUpload(e.target.files)}
              ref={FileInputRef}
              aria-label="Upload slides"
              title="Upload slides"
            />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`px-4 py-2.5 rounded-full ${
                CanEditSlides
                  ? "bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 text-white font-medium hover:bg-rose-500/30"
                  : "bg-gray-700/20 border border-gray-700/30 text-gray-400 cursor-not-allowed"
              } flex items-center gap-2 transition-colors`}
              onClick={() => CanEditSlides && FileInputRef.current?.click()}
              disabled={!CanEditSlides}
              title={
                CanEditSlides
                  ? "Dodaj slajdy"
                  : "Brak uprawnień do dodawania slajdów"
              }
            >
              <i className="fas fa-cloud-upload-alt"></i>
              <span>Dodaj slajdy</span>
            </motion.button>
          </motion.div>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row p-4">
          <div className="md:w-7/12 lg:w-8/12 pr-0 md:pr-5 h-[300px] md:h-full flex flex-col">
            <div className="flex-1 rounded-2xl overflow-hidden relative bg-gradient-to-br from-gray-900 to-black border border-gray-800/80 shadow-[0_0_30px_rgba(0,0,0,0.4)] mb-4 md:mb-0">
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/70 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none"></div>

              {SelectedSlide ? (
                <motion.div
                  key={SelectedSlide.Id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full flex items-center justify-center p-8"
                >
                  <div className="relative w-full h-full shadow-2xl">
                    <Image
                      src={SelectedSlide.ImageData}
                      alt={SelectedSlide.Name}
                      fill
                      style={{ objectFit: "contain" }}
                      className="transition-all duration-300"
                      priority
                    />
                  </div>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-gray-700/50 z-20">
                    <button
                      onClick={() =>
                        HandleDownload(
                          SelectedSlide.ImageData,
                          SelectedSlide.Name,
                        )
                      }
                      className="flex items-center justify-center h-8 w-8 bg-rose-500/30 hover:bg-rose-500/50 rounded-full transition-colors text-white -ml-1"
                      aria-label="Pobierz slajd"
                      title="Pobierz slajd"
                    >
                      <i className="fas fa-download text-sm"></i>
                    </button>

                    <div className="h-4 w-px bg-gray-600"></div>

                    <div className="flex items-center">
                      <i className="far fa-clock text-rose-400 mr-2 text-sm"></i>
                      <span className="text-white text-sm font-medium">
                        {SelectedSlide.Duration}s
                      </span>
                    </div>
                  </div>

                  <div className="absolute top-6 left-6 max-w-[70%] px-4 py-2 bg-black/60 backdrop-blur-md rounded-lg border border-gray-700/50 z-20 group">
                    {IsEditingName ? (
                      <div className="flex items-center">
                        <input
                          ref={NameInputRef}
                          type="text"
                          value={EditedName}
                          onChange={HandleNameChange}
                          onBlur={HandleNameSave}
                          onKeyDown={HandleNameKeyDown}
                          className="bg-transparent text-white text-sm font-medium outline-none border-b border-rose-400/30 focus:border-rose-400 w-full"
                          aria-label="Edytuj nazwę slajdu"
                        />
                        <span className="text-gray-400 text-xs ml-1">
                          {GetFileExtension(SelectedSlide.Name)}
                        </span>
                      </div>
                    ) : (
                      <div
                        onClick={() => HandleNameEdit(SelectedSlide.Id)}
                        className={`flex items-center ${CanEditSlides ? "cursor-pointer group-hover:text-rose-300" : ""} transition-colors`}
                      >
                        <p className="text-white text-sm font-medium truncate group-hover:text-rose-100">
                          {GetFileNameWithoutExtension(SelectedSlide.Name)}
                        </p>
                        <span className="text-gray-400 text-sm">
                          {GetFileExtension(SelectedSlide.Name)}
                        </span>
                        {CanEditSlides && (
                          <i className="fas fa-pencil-alt text-gray-400 ml-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"></i>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <div className="bg-gray-800/40 rounded-full p-6 mb-4">
                    <i className="far fa-image text-gray-500 text-5xl"></i>
                  </div>
                  <p className="text-gray-400 text-lg max-w-md">
                    Wybierz lub dodaj slajd, aby zobaczyć podgląd
                  </p>
                </div>
              )}
            </div>

            <div
              className={`h-24 mt-auto rounded-xl p-3 hidden md:flex flex-wrap gap-2 border ${IsDragging ? "border-rose-500 bg-rose-500/10" : "border-gray-700/50 bg-gray-800/20"} transition-all duration-300`}
              onDragOver={HandleDragOver}
              onDragLeave={HandleDragLeave}
              onDrop={HandleDrop}
            >
              {IsLoading ? (
                <div className="flex items-center gap-3 w-full h-full justify-center">
                  <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-300 text-sm">Przetwarzanie...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="flex items-center text-gray-400">
                      <i className="fas fa-arrow-down text-rose-400 mr-2 animate-bounce"></i>
                      <p className="text-sm">Przeciągnij i upuść pliki tutaj</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="md:w-5/12 lg:w-4/12 h-[calc(100%-300px)] md:h-full mt-4 md:mt-0">
            <div className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-800/60 overflow-hidden h-full flex flex-col shadow-lg">
              <div className="p-4 border-b border-gray-700/30 flex items-center justify-between">
                <h4 className="text-white font-medium flex items-center">
                  <i className="fas fa-list text-rose-400 mr-2"></i>
                  Lista slajdów
                </h4>
                {_Slides.length > 0 && (
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => {
                        if (_Slides.length > 0 && CanEditSlides) {
                          SetSlideToDelete("all");
                          SetIsConfirmModalOpen(true);
                        } else if (!CanEditSlides) {
                          ShowToast(
                            "Nie masz uprawnień do usuwania slajdów",
                            "error",
                          );
                        }
                      }}
                      className={`text-xs text-white ${
                        CanEditSlides
                          ? "bg-rose-600/20 hover:bg-rose-600/40 border border-rose-600/30"
                          : "bg-gray-700/20 border border-gray-700/30 text-gray-400 cursor-not-allowed"
                      } px-2 py-1 rounded-full flex items-center gap-1 transition-colors`}
                      title={
                        CanEditSlides
                          ? "Usuń wszystkie slajdy"
                          : "Brak uprawnień do usuwania slajdów"
                      }
                    >
                      <i className="fas fa-trash-alt text-xs"></i>
                      <span>Usuń wszystkie</span>
                    </motion.button>
                    <span className="text-xs text-white bg-rose-500/20 px-3 py-1 rounded-full border border-rose-500/30">
                      {_Slides.length}{" "}
                      {_Slides.length === 1
                        ? "slajd"
                        : _Slides.length < 5
                          ? "slajdy"
                          : "slajdów"}
                    </span>
                  </div>
                )}
              </div>

              <div
                ref={SlideContainerRef}
                className="p-3 overflow-y-auto custom-scrollbar flex-1 select-none"
                tabIndex={-1}
                onKeyDown={HandleContainerKeyDown}
              >
                {_Slides.length > 0 ? (
                  <AnimatePresence>
                    <div className="space-y-2.5">
                      {_Slides.map((Slide, Index) => (
                        <motion.div
                          key={Slide.Id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                            delay: Index * 0.05,
                          }}
                          className="relative"
                        >
                          {DragOverSlide === Slide.Id &&
                            DragPosition === "above" && (
                              <div className="absolute top-0 left-0 right-0 h-0.5 bg-rose-400 z-10 -translate-y-1.5 shadow-[0_0_10px_rgba(244,63,94,0.7)]"></div>
                            )}

                          <div
                            className={`group rounded-lg overflow-hidden transition-all flex border 
                              ${SelectedSlide?.Id === Slide.Id ? "bg-gradient-to-r from-rose-500/20 to-rose-900/20 border-rose-500/40 ring-1 ring-rose-500/20" : "bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50"}
                              ${DraggedSlide === Slide.Id ? "opacity-50" : ""}
                              ${DeletingSlideId === Slide.Id || DeletingSlideId === "all" ? "opacity-40 bg-rose-900/20" : ""}
                              focus:outline-none focus:ring-2 focus:ring-rose-500/50`}
                            onClick={() => SetSelectedSlide(Slide)}
                            draggable={CanEditSlides}
                            onDragStart={() => HandleDragStart(Slide.Id)}
                            onDragEnd={HandleDragEnd}
                            onDragOver={(e) => {
                              e.preventDefault();
                              HandleDragOverSlide(Slide.Id, e);
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              HandleDropOnSlide();
                            }}
                            onKeyDown={(e) => HandleKeyDown(e, Slide.Id)}
                            tabIndex={0}
                          >
                            <div className="h-20 w-30 overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={Slide.ImageData}
                                alt={Slide.Name}
                                fill
                                style={{ objectFit: "cover" }}
                              />
                              <div
                                className={`absolute inset-0 ${SelectedSlide?.Id === Slide.Id ? "bg-rose-500/10" : "bg-black/30 group-hover:bg-black/10"} transition-colors duration-200`}
                              ></div>
                              {(DeletingSlideId === Slide.Id ||
                                DeletingSlideId === "all") && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                                  <div className="w-5 h-5 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 p-2 flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <p className="text-white text-sm truncate font-medium pr-2">
                                  {Slide.Name}
                                </p>
                                {CanEditSlides && (
                                  <div className="cursor-grab active:cursor-grabbing opacity-50 group-hover:opacity-100 transition-opacity">
                                    <i className="fas fa-grip-lines text-gray-500 text-xs"></i>
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-1 select-none">
                                <div className="flex items-center">
                                  <label
                                    htmlFor={`duration-${Slide.Id}`}
                                    className="text-gray-400 text-xs mr-2"
                                  >
                                    Czas:
                                  </label>
                                  <div className="relative flex items-center">
                                    <input
                                      id={`duration-${Slide.Id}`}
                                      type="number"
                                      value={Slide.Duration}
                                      min={1}
                                      max={60}
                                      onChange={(e) =>
                                        HandleDurationChange(
                                          Slide.Id,
                                          parseInt(e.target.value) || 1,
                                        )
                                      }
                                      className="bg-black/30 border border-gray-700/50 focus:border-rose-500/50 rounded w-12 text-white text-xs px-2 py-1 outline-none transition-colors text-center"
                                      aria-label={`Czas wyświetlania slajdu ${Slide.Name} w sekundach`}
                                      title="Czas wyświetlania slajdu w sekundach"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    <span className="text-gray-500 text-xs ml-1">
                                      s
                                    </span>
                                  </div>
                                </div>

                                <div className="flex space-x-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      HandleDownload(
                                        Slide.ImageData,
                                        Slide.Name,
                                      );
                                    }}
                                    className="text-gray-400 hover:text-white bg-black/20 hover:bg-black/40 p-1 rounded transition-colors"
                                    aria-label="Pobierz slajd"
                                    title="Pobierz slajd"
                                  >
                                    <i className="fas fa-download text-xs"></i>
                                  </button>
                                  {CanEditSlides && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        RequestRemoveSlide(Slide.Id);
                                      }}
                                      className="text-gray-400 hover:text-rose-400 bg-black/20 hover:bg-black/40 p-1 rounded transition-colors"
                                      aria-label="Usuń slajd"
                                      title="Usuń slajd"
                                    >
                                      <i className="fas fa-trash-alt text-xs"></i>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {DragOverSlide === Slide.Id &&
                            DragPosition === "below" &&
                            Index === _Slides.length - 1 && (
                              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-400 z-10 translate-y-1.5 shadow-[0_0_10px_rgba(244,63,94,0.7)]"></div>
                            )}
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-8">
                    <div className="rounded-full bg-gray-800/50 p-6 mb-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-rose-800/5"></div>
                      <i className="far fa-image text-gray-500 text-4xl relative z-10"></i>
                    </div>
                    <p className="text-gray-400 text-sm max-w-xs text-center">
                      Brak slajdów. Dodaj slajdy, aby rozpocząć.
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`mt-4 px-4 py-2 rounded-full ${
                        CanEditSlides
                          ? "bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-white"
                          : "bg-gray-700/20 border border-gray-700/30 text-gray-400 cursor-not-allowed"
                      } text-sm flex items-center gap-2 transition-colors`}
                      onClick={() =>
                        CanEditSlides && FileInputRef.current?.click()
                      }
                      disabled={!CanEditSlides}
                      title={
                        CanEditSlides
                          ? "Dodaj slajdy"
                          : "Brak uprawnień do dodawania slajdów"
                      }
                    >
                      <i className="fas fa-plus"></i>
                      <span>Dodaj teraz</span>
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-gray-700/30 flex justify-center md:hidden">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-2.5 rounded-lg ${
                    CanEditSlides
                      ? "bg-rose-500/20 backdrop-blur-sm border border-rose-500/30 text-white font-medium hover:bg-rose-500/30"
                      : "bg-gray-700/20 border border-gray-700/30 text-gray-400 cursor-not-allowed"
                  } flex items-center justify-center gap-2 transition-colors`}
                  onClick={() => CanEditSlides && FileInputRef.current?.click()}
                  disabled={!CanEditSlides}
                  title={
                    CanEditSlides
                      ? "Dodaj slajdy"
                      : "Brak uprawnień do dodawania slajdów"
                  }
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  <span>Dodaj slajdy</span>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        IsOpen={IsConfirmModalOpen}
        OnClose={() => SetIsConfirmModalOpen(false)}
        OnConfirm={HandleRemoveSlide}
        Title="Potwierdź usunięcie"
        Message={
          SlideToDelete === "all"
            ? `Czy na pewno chcesz usunąć wszystkie slajdy? Tej operacji nie można cofnąć.`
            : `Czy na pewno chcesz usunąć ten slajd? Tej operacji nie można cofnąć.`
        }
        ConfirmText={SlideToDelete === "all" ? "Usuń wszystkie" : "Usuń slajd"}
        IsLoading={DeletingSlideId !== null && IsLoading}
        IconClassName="fas fa-trash-alt text-rose-400"
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(244, 63, 94, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(244, 63, 94, 0.3);
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default Slajdy;

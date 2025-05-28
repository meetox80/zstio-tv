export const ConvertToBase64 = (File: File): Promise<string> => {
  return new Promise((Resolve, Reject) => {
    const FileReader = new window.FileReader()
    FileReader.readAsDataURL(File)
    FileReader.onload = () => Resolve(FileReader.result as string)
    FileReader.onerror = (Error) => Reject(Error)
  })
}

export const OptimizeBase64Image = (Base64String: string, MaxWidth = 1920, MaxHeight = 1080): Promise<string> => {
  return new Promise((Resolve, Reject) => {
    const Image = new window.Image()
    Image.onload = () => {
      let Width = Image.width
      let Height = Image.height
      
      if (Width > MaxWidth || Height > MaxHeight) {
        const Ratio = Math.min(MaxWidth / Width, MaxHeight / Height)
        Width *= Ratio
        Height *= Ratio
      }
      
      const Canvas = document.createElement('canvas')
      Canvas.width = Width
      Canvas.height = Height
      
      const Context = Canvas.getContext('2d')
      if (!Context) {
        Reject(new Error('Could not get canvas context'))
        return
      }
      
      Context.drawImage(Image, 0, 0, Width, Height)
      
      const OptimizedBase64 = Canvas.toDataURL('image/jpeg', 0.8)
      Resolve(OptimizedBase64)
    }
    
    Image.onerror = () => {
      Reject(new Error('Error loading image'))
    }
    
    Image.src = Base64String
  })
} 
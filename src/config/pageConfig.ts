"use client";

export interface PageConfig {
  Key: string;
  Enabled: boolean;
}

const PageConfiguration: PageConfig[] = [
  { Key: "pomodoro", Enabled: true },
  { Key: "substitutions", Enabled: false },
  { Key: "vote", Enabled: true },
  { Key: "slides", Enabled: true },
];

export function GetEnabledPages(): string[] {
  return PageConfiguration
    .filter(page => page.Enabled)
    .map(page => page.Key);
}

export function IsPageEnabled(pageKey: string): boolean {
  const Page = PageConfiguration.find(page => page.Key === pageKey);
  return Page ? Page.Enabled : false;
}

export default PageConfiguration;

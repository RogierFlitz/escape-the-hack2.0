"use client";

import { officePeople, officeVendors, type Investigation } from "../Intranet";
import { HelpdeskApp, ProjectsApp } from "./Boards";
import { AppCenter, type OsAppId } from "./Center";
import { ChatApp } from "./Chat";
import { ContactsApp, NotesApp, SecurityApp, SettingsApp } from "./DeskApps";
import { SocialApp } from "./Social";

export function OfficeSuite({
  app,
  investigation,
  focusId,
  audio,
  teamCode,
  onToggleAudio,
  onOpen,
  onOpenDoc,
  onPerson,
}: {
  app: string;
  investigation: Investigation;
  focusId?: string | null;
  audio: boolean;
  teamCode: string;
  onToggleAudio: () => void;
  onOpen: (id: OsAppId) => void;
  onOpenDoc: (id: string) => void;
  onPerson: (name: string) => void;
}) {
  if (app === "center") return <AppCenter onOpen={onOpen} />;
  if (app === "social") return <SocialApp investigation={investigation} focusId={focusId} onPerson={onPerson} />;
  if (app === "chat") return <ChatApp investigation={investigation} focusId={focusId} />;
  if (app === "projecten") return <ProjectsApp investigation={investigation} focusId={focusId} onOpenDoc={onOpenDoc} onPerson={onPerson} />;
  if (app === "helpdesk") return <HelpdeskApp investigation={investigation} focusId={focusId} />;
  if (app === "contacten") {
    return (
      <ContactsApp
        people={officePeople()}
        vendors={officeVendors()}
        investigation={investigation}
        focusId={focusId}
      />
    );
  }
  if (app === "notities") return <NotesApp investigation={investigation} focusId={focusId} teamCode={teamCode} />;
  if (app === "security") return <SecurityApp />;
  if (app === "instellingen") return <SettingsApp audio={audio} onToggleAudio={onToggleAudio} />;
  return null;
}

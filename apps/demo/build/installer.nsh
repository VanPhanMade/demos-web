!macro customInit
  CreateDirectory "$LOCALAPPDATA\Codex Pixel Engine Demo\logs"
  ClearErrors
  FileOpen $9 "$LOCALAPPDATA\Codex Pixel Engine Demo\logs\installer-log.txt" a
  FileSeek $9 0 END
  FileWrite $9 "[Codex Pixel Engine Demo Installer] installer initialized$\r$\n"
  FileWrite $9 "[Codex Pixel Engine Demo Installer] install directory: $INSTDIR$\r$\n"
  FileClose $9
!macroend

!macro customInstall
  CreateDirectory "$LOCALAPPDATA\Codex Pixel Engine Demo\logs"
  ClearErrors
  FileOpen $9 "$LOCALAPPDATA\Codex Pixel Engine Demo\logs\installer-log.txt" a
  FileSeek $9 0 END
  FileWrite $9 "[Codex Pixel Engine Demo Installer] install files completed$\r$\n"
  FileWrite $9 "[Codex Pixel Engine Demo Installer] installed app executable: $INSTDIR\${APP_EXECUTABLE_FILENAME}$\r$\n"
  FileWrite $9 "[Codex Pixel Engine Demo Installer] installer completed$\r$\n"
  FileClose $9
!macroend

!macro customUnInit
  CreateDirectory "$LOCALAPPDATA\Codex Pixel Engine Demo\logs"
  ClearErrors
  FileOpen $9 "$LOCALAPPDATA\Codex Pixel Engine Demo\logs\installer-log.txt" a
  FileSeek $9 0 END
  FileWrite $9 "[Codex Pixel Engine Demo Installer] uninstaller initialized$\r$\n"
  FileWrite $9 "[Codex Pixel Engine Demo Installer] uninstall directory: $INSTDIR$\r$\n"
  FileClose $9
!macroend

!macro customUnInstall
  CreateDirectory "$LOCALAPPDATA\Codex Pixel Engine Demo\logs"
  ClearErrors
  FileOpen $9 "$LOCALAPPDATA\Codex Pixel Engine Demo\logs\installer-log.txt" a
  FileSeek $9 0 END
  FileWrite $9 "[Codex Pixel Engine Demo Installer] uninstall completed$\r$\n"
  FileClose $9
!macroend


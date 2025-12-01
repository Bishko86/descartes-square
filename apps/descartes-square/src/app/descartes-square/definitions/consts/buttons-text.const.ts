export const ButtonsText = new Map<string, string>()
  .set('add', $localize`:@@add:Add Argument`)
  .set('remove', $localize`:@@remove:Remove`)
  .set('save', $localize`:@@save:Save`)
  .set('cancel', $localize`:@@cancel:Cancel`)
  .set('edit', $localize`:@@edit:Edit`)
  .set('addTitle', $localize`:@@addTitle:Add Title`)
  .set('aiSuggestion', $localize`:@@aiSuggestion:AI Suggestion`);

export const CommonText = new Map<string, string>().set(
  'unsavedChanges',
  $localize`:@@confirm.unsavedChanges:Are you sure you want to clear this form? All unsaved changes will be lost.`,
);

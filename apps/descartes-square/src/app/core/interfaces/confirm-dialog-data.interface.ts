import { ConfirmDialogType } from '@core/enums/confirm-dialog-type.enum';

export interface IConfirmDialogData {
  type: ConfirmDialogType;
  title?: string;
  message?: string;
  itemName?: string;
}

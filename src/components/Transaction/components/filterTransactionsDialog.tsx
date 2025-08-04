import * as React from "react";
import Button from "../../button";
import Dialog from "../../ui/dialog";

const FilterTransactionsDialog = ({
  open,
  title,
  description,
  onOpenChange,
  onConfirmAction,
  onClearFilters,
  isFullScreen = false,
  showCloseButton = false,
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  onOpenChange: (open: boolean) => void;
  onConfirmAction: () => void;
  onClearFilters: () => void;
  isFullScreen?: boolean;
  showCloseButton?: boolean;
  children?: React.ReactNode;
}) => {
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      actionComponent={
        <Button
          colors="green"
          onClick={() => {
            onConfirmAction();
            onOpenChange(false);
          }}
        >
          Mostrar resultados
        </Button>
      }
      cancelComponent={
        <Button
          colors="black"
          onClick={() => {
            onClearFilters();
          }}
        >
          Limpar e fechar
        </Button>
      }
      title={title}
      description={description}
      isFullScreen={isFullScreen}
      showCloseButton={showCloseButton}
    >
      {children || null}
    </Dialog>
  );
};
export default FilterTransactionsDialog;

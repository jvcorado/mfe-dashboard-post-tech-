"use client";

import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { useAuth } from "@/context/AuthContext";
import { TransactionService } from "@/services/TransactionService";
import { TransactionSubtype, TransactionType } from "@/models/TransactionType";
import Button from "@/components/button";
import Snackbar, { SnackbarProps } from "@/components/snackbar";
import { Input } from "@/components/ui/input";
import { transactionTypes } from "@/constants/transactionTypes";

import Transacaobg2 from "@/assets/illustrations/Transacaobg2";
import Transacaobg3 from "@/assets/illustrations/Transacaobg3";
import Transacaobg1 from "@/assets/illustrations/Transacaobg1";
import IconeSeta from "@/assets/illustrations/IconeSeta";
import { LoaderCircle } from "lucide-react";
import { format } from "date-fns";
import UploadDocument from "./uploadDocument";

export default function NewTransactions() {
  const { accounts, updateAfterTransaction } = useAuth();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [typeSelected, setTypeSelected] = useState<
    (typeof transactionTypes)[0] | null
  >(null);
  const [amount, setAmount] = useState("");
  const [disabledButton, setDisabledButton] = useState(true);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [type, setType] = useState<TransactionType>(TransactionType.INCOME);
  const [subtype, setSubType] = useState<TransactionSubtype>(
    TransactionSubtype.DOC_TED
  );
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [lastTransaction, setLastTransaction] = useState<{
    label: string;
    amount: number;
    timestamp: number;
  } | null>(null);
  const [messageSnackbar, setMessageSnackbar] = useState<SnackbarProps>({
    show: showSnackbar,
    setShow: setShowSnackbar,
  });
  const [loading, setLoading] = useState(false);

  const formatValue = (valor: string) => {
    const onlyNumbers = valor.replace(/\D/g, ".");

    const number = (parseFloat(onlyNumbers) / 100).toFixed(2);
    return number.replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const parsedAmount = parseFloat((Number(amount) / 100).toFixed(2));

    const isValidDate = date !== "" && !isNaN(Date.parse(date));
    const isTypeSelected = typeSelected !== null;
    const isAmountValid =
      amount !== "" && !isNaN(parsedAmount) && parsedAmount > 0;

    const isValid =
      isTypeSelected && isAmountValid && isValidDate && date !== "";

    setDisabledButton(!isValid);
  }, [typeSelected, amount, date]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Verificar se accounts existe e tem pelo menos um elemento
    if (!accounts || accounts.length === 0) {
      setMessageSnackbar({
        show: true,
        setShow: setShowSnackbar,
        description: "Conta não disponível para criar transação",
        type: "error",
      });

      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);

      return;
    }

    const parsedAmount = parseFloat((Number(amount) / 100).toFixed(2));
    const now = Date.now();

    const isDuplicatedTransaction =
      lastTransaction &&
      typeSelected?.label === lastTransaction.label &&
      parsedAmount === lastTransaction.amount &&
      now - lastTransaction.timestamp < 20000;

    if (isDuplicatedTransaction) {
      setMessageSnackbar({
        ...messageSnackbar,
        show: true,
        title: "Transação repetida",
        description: "Você está tentando repetir uma transação idêntica.",
        type: "warning",
      });

      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);

      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setMessageSnackbar({
        show: true,
        setShow: setShowSnackbar,
        description: "Valor inválido.",
        type: "error",
      });

      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);

      return;
    }

    try {
      setLoading(true);

      if (!accounts || accounts.length === 0) {
        throw new Error("Conta não disponível para criar transação");
      }

      //TODOL Adicionar subtype ao criar transação
      await TransactionService.create(
        accounts[0].id,
        type,
        subtype,
        typeSelected?.label as string,
        parsedAmount,
        documentFile?.name
      );

      await updateAfterTransaction();

      setAmount("");
      setType(typeSelected?.type as TransactionType);
      setTypeSelected(null);
      setSubType(typeSelected?.subtype as TransactionSubtype);
      setDocumentFile(null);
      setLastTransaction({
        label: typeSelected?.label as string,
        amount: parsedAmount,
        timestamp: Date.now(),
      });

      setMessageSnackbar({
        ...messageSnackbar,
        show: true,
        title: "Sucesso",
        description: "Transação concluída com sucesso!",
        type: "success",
      });

      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";

      setMessageSnackbar({
        ...messageSnackbar,
        show: true,
        title: "Erro",
        description: errorMessage,
        type: "error",
      });

      setTimeout(() => {
        setShowSnackbar(false);
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full gap-6 bg-[#CBCBCB] flex flex-col rounded-md relative">
      <div className="absolute top-0 left-0 md:left-auto md:right-0 h-[142px] w-[142px] md:h-[177px] md:w-[180px]">
        <Transacaobg2 className="w-full h-full" />
      </div>

      <h2 className="relative pt-4 text-[25px] sm:text-[22px] md:text-[25px] font-bold z-10 sm:text-left ml-4 sm:ml-8 md:ml-16">
        Nova transação
      </h2>

      <form
        onSubmit={(e) => handleSubmit(e)}
        noValidate
        className="relative min-h-[402px] flex flex-col z-10 "
      >
        <div className="z-10 relative pt-5 rounded-md ml-4 sm:ml-8 md:ml-16">
          <Listbox
            value={typeSelected}
            onChange={(value) => {
              setTypeSelected(value);
              setType(value?.type as TransactionType);
              setSubType(value?.subtype as TransactionSubtype);
            }}
          >
            {() => (
              <div className="relative">
                <Listbox.Button
                  aria-label="Selecionar tipo de transação"
                  className="w-full max-w-[355px] z-10 min-h-[48px] border border-[#004D61] rounded-lg bg-white text-[#444444] px-4 py-2 text-base flex items-center justify-between"
                >
                  <span className="truncate">
                    {typeSelected
                      ? typeSelected.label
                      : "Selecione o tipo de transação"}
                  </span>
                  <IconeSeta />
                </Listbox.Button>

                <Listbox.Options className="w-full max-w-[355px] absolute mt-1 border rounded-lg border-[#004D61] bg-white shadow-md text-start text-base z-10">
                  {transactionTypes.map((type) => (
                    <Listbox.Option
                      key={`${type.label}-${type.subtype}`}
                      value={type}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${
                          active
                            ? "bg-[#E4EDE3] text-black rounded-lg"
                            : "text-[#444444]"
                        }`
                      }
                    >
                      {type.label}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            )}
          </Listbox>
          <input
            type="hidden"
            name="tipoTransacao"
            value={typeSelected?.type || ""}
          />
        </div>

        <div className="relative pt-4 ml-4 sm:ml-8 md:ml-16 w-full max-w-[250px]">
          <label htmlFor="valor" className="block font-medium mb-1 text-base">
            Valor:
          </label>
          <Input
            type="text"
            id="valor"
            name="valor"
            required
            placeholder="R$ 0,00"
            inputMode="numeric"
            className="w-full min-h-[48px] border border-[#004D61] bg-white text-[#444444] text-center rounded-lg text-base"
            value={amount ? `R$ ${formatValue(amount)}` : ""}
            onChange={(e) => {
              const rawValue = e.target.value.replace(/\D/g, "");
              const limited = rawValue.slice(0, 9);
              setAmount(limited);
            }}
          />
        </div>

        <div className="relative pt-4 ml-4 sm:ml-8 md:ml-16">
          <label htmlFor="data" className="block font-medium mb-1 text-base">
            Data:
          </label>
          <input
            type="date"
            id="data"
            name="data"
            required
            onKeyDown={(e) => e.preventDefault()}
            value={date}
            max={format(new Date(), "yyyy-MM-dd")}
            onChange={(e) => setDate(e.target.value)}
            className="w-full z-10 max-w-[250px] min-h-[48px] border border-[#004D61] bg-white text-[#444444] rounded-lg py-2 px-2 text-base"
          />
        </div>

        <div className="relative pt-4 ml-4 sm:ml-8 md:ml-16">
          <label className="block font-medium mb-1 text-base">
            Comprovante:
          </label>
          <UploadDocument
            onFileSelected={(file) => setDocumentFile(file)}
            selectedFile={documentFile}
          />
        </div>

        <div className="pt-8 ml-4 sm:ml-8 md:ml-16 w-full flex flex-col justify-start z-8">
          <Button
            type="submit"
            disabled={disabledButton}
            colors="dark-blue"
            aria-busy={loading}
          >
            {loading ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Concluir transação"
            )}
          </Button>
        </div>
      </form>
      <div className="absolute bottom-0 right-0 md:right-auto md:left-0 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[142px] md:h-[142px] lg:w-[177px] lg:h-[177px] max-w-full overflow-hidden">
        <Transacaobg1 className="w-full h-full object-contain" />
      </div>

      <div className="bottom-4 right-0 max-w-full lg:hidden z-10 items-center">
        <Transacaobg3 className="w-[100px] h-[100px] sm:w-[120px] right-0 sm:h-[120px] items-center object-contain z-10 lg:hidden" />
      </div>
      <Snackbar aria-live="assertive" {...messageSnackbar} />
    </div>
  );
}

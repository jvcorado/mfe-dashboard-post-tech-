"use client";

import React, { useState, useEffect } from "react";
import {
  Pencil,
  Trash2,
  Loader,
  X,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import Input from "@/components/input";
import TransactionList from "@/components/Transaction/components/transactionList";
import EditTransactionDialog from "@/components/Transaction/components/editTransactionDialog";
import FilterTransactionsDialog from "@/components/Transaction/components/filterTransactionsDialog";
import SelectTransactionPeriod from "@/components/Transaction/components/selectTransactionPeriod";
import { TransactionSubtype, TransactionType } from "@/models/TransactionType";
import SelectTransactionType from "@/components/Transaction/components/selectTransactionType";
import EditTransactionForm from "@/components/Transaction/components/editTransactionForm";
import PaginationControls from "@/components/paginationControls";
import { useIsMobile } from "@/hooks/useIsMobile";

import ActionButton from "@/components/actionButton";
import { useAuth } from "@/context/AuthContext";
import { AccountService } from "@/services/AccountService";
import { TransactionService } from "@/services/TransactionService";
import { Transaction } from "@/models/Transaction";
import { getDateRange } from "@/lib/utils";

type EditableTransaction = {
  id?: number;
  description: string;
  amount: number;
  type: TransactionType;
  subtype: TransactionSubtype;
  date: Date;
  document?: string;
};

type FilterPeriod =
  | "today"
  | "yesterday"
  | "seven-days"
  | "fifteen-days"
  | "month"
  | "year";

export default function TransactionsSection() {
  const { accounts, updateAfterTransaction } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditTransactionItem, setIsEditTransactionItem] = useState(false);
  const [isDeleteTransactionItem, setIsDeleteTransactionItem] = useState(false);
  const [editableTransaction, setEditableTransaction] = useState<
    EditableTransaction | undefined
  >(undefined);
  const [isSelectingTransactionItem, setIsSelectingTransactionItem] =
    useState(false);
  const isMobile = useIsMobile();
  const [isOpenFilterDialog, setIsOpenFilterDialog] = useState(false);
  const [searchTransaction, setSearchTransaction] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<FilterPeriod>("year");
  const [selectedSubtype, setSelectedSubtype] = useState<string | undefined>(
    undefined
  );
  const [tempPeriod, setTempPeriod] = useState(selectedPeriod);
  const [tempSubtype, setTempSubtype] = useState(selectedSubtype);
  const transactionsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const fetchTransactions = async (page?: number, filters?: object) => {
    if (!accounts || accounts.length === 0) {
      console.log("Nenhuma conta disponível para buscar transações");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const getByIdParams = {
        id: accounts[0].id.toString(),
        page: page || currentPage,
        perPage: transactionsPerPage,
        filters,
      };

      const { transactions: accountTransactions, pagination } =
        await AccountService.getById({ ...getByIdParams });
      console.log("Transações obtidas:", accountTransactions);
      setTotalTransactions(pagination.totalItems || 0);
      setTransactions(accountTransactions);
      setCurrentPage(pagination.currentPage || 1);
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setLoading(false);
    }
  };

  const changePage = async (page: number) => {
    setCurrentPage(page);
    await fetchTransactions(page);
  };

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  const handleSelectTransactionItem = (transaction: Transaction) => {
    setEditableTransaction({
      id: transaction.id,
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      subtype: transaction.subtype,
      date: transaction.created_at
        ? new Date(transaction.created_at)
        : new Date(),
      document: transaction.document,
    });

    setIsSelectingTransactionItem(true);
  };

  // TODO: Verificar se é necessário atualizar essa função depois de atualizar a função de update
  const handleConfirmEditTransaction = async () => {
    if (editableTransaction && editableTransaction.id) {
      if (!accounts || accounts.length === 0) {
        console.error("Nenhuma conta disponível para atualizar transação");
        return;
      }

      try {
        await TransactionService.update(
          editableTransaction.id,
          editableTransaction.type,
          editableTransaction.subtype,
          editableTransaction.amount,
          editableTransaction.description,
          editableTransaction.document
        );

        // Atualizar dados após transação
        await updateAfterTransaction();

        setIsSelectingTransactionItem(false);
        setIsEditTransactionItem(false);
        setEditableTransaction(undefined);
      } catch (error) {
        console.error("Erro ao atualizar transação:", error);
      }
    }
  };

  const handleConfirmDeleteTransaction = async () => {
    if (editableTransaction && editableTransaction.id) {
      // Verificar se accounts existe e tem pelo menos um elemento
      if (!accounts || accounts.length === 0) {
        console.error("Nenhuma conta disponível para deletar transação");
        return;
      }

      try {
        await TransactionService.delete(editableTransaction.id);

        // Atualizar dados após transação
        await updateAfterTransaction();

        setIsSelectingTransactionItem(false);
        setIsDeleteTransactionItem(false);
        setEditableTransaction(undefined);
      } catch (error) {
        console.error("Erro ao deletar transação:", error);
      }
    }
  };

  const handleOpenFilterDialog = (open: boolean) => {
    setIsOpenFilterDialog(open);
    if (open) {
      setTempPeriod(selectedPeriod);
      setTempSubtype(selectedSubtype);
    }
  };

  const handleConfirmFilters = () => {
    setSelectedPeriod(tempPeriod);
    setSelectedSubtype(tempSubtype);
    setIsOpenFilterDialog(false);

    const filters = {
      startDate: getDateRange(tempPeriod).startDate,
      endDate: getDateRange(tempPeriod).endDate,
      subtype: tempSubtype,
      search: searchTransaction,
    };

    fetchTransactions(1, filters);
  };

  const handleClearFilters = () => {
    setTempPeriod("year");
    setTempSubtype(undefined);

    setSelectedPeriod("year");
    setSelectedSubtype(undefined);
    setSearchTransaction("");
  };

  if (transactions.length === 0 && loading) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 h-50 lg:h-10 lg:min-w-[250px]">
        <p className="text-[16px] font-bold">Carregando transações</p>
        <Loader size={20} color="#47A138" />
      </div>
    );
  }

  return (
    <div
      className="h-auto w-auto h-full overflow-y-scroll overflow-x-hidden scrollbar-hidden relative bg-white 
      flex flex-col items-center rounded-md pt-10 pb-10 justify-between md:min-w-[245px]"
    >
      <div className="flex flex-col text-center md:text-left gap-[24px] overflow-y-auto scrollbar-hidden">
        <div className="flex relative w-full gap-2">
          <Input
            icon={<Search size={18} />}
            placeholder="Buscar transação..."
            value={searchTransaction}
            onChange={(e) => setSearchTransaction(e.target.value)}
          />
          <ActionButton
            onClick={() => setIsOpenFilterDialog((prev) => !prev)}
            content={<SlidersHorizontal size={18} />}
            colors="green"
            size="md"
          />
        </div>
        <div className="flex flex-rol justify-between">
          <h1 className="text-[25px] font-bold">Extrato</h1>
          <div className="flex gap-3">
            <ActionButton
              onClick={() => {
                setIsEditTransactionItem((prev) => !prev);
                setIsDeleteTransactionItem(false);
                setIsSelectingTransactionItem(false);
                setEditableTransaction(undefined);
              }}
              content={
                isEditTransactionItem ? <X size={22} /> : <Pencil size={22} />
              }
              colors="blue"
              size="default"
            />

            <ActionButton
              onClick={() => {
                setIsDeleteTransactionItem((prev) => !prev);
                setIsEditTransactionItem(false);
                setIsSelectingTransactionItem(false);
                setEditableTransaction(undefined);
              }}
              content={
                isDeleteTransactionItem ? <X size={22} /> : <Trash2 size={22} />
              }
              colors="blue"
              size="default"
            />
          </div>
        </div>
        {transactions.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-50 lg:h-10 min-w-[250px]">
            <p className="text-[16px]">Nenhuma transação foi realizada</p>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            isEditTransactionItem={isEditTransactionItem}
            isDeleteTransactionItem={isDeleteTransactionItem}
            handleSelectTransactionItem={handleSelectTransactionItem}
          />
        )}
      </div>
      <EditTransactionDialog
        title={`${isEditTransactionItem ? "Editar" : "Deletar"} transação`}
        description={`${
          isEditTransactionItem
            ? "Edite os dados da transação"
            : "Você tem certeza que deseja deletar essa transação?"
        }`}
        onConfirmAction={
          isEditTransactionItem
            ? handleConfirmEditTransaction
            : handleConfirmDeleteTransaction
        }
        open={isSelectingTransactionItem}
        onOpenChange={setIsSelectingTransactionItem}
      >
        {isEditTransactionItem && (
          <EditTransactionForm
            transaction={editableTransaction}
            onChange={setEditableTransaction}
          />
        )}
      </EditTransactionDialog>
      <FilterTransactionsDialog
        open={isOpenFilterDialog}
        title="Filtrar transações"
        description="Selecione os filtros desejados para visualizar as transações."
        onOpenChange={handleOpenFilterDialog}
        onConfirmAction={handleConfirmFilters}
        onClearFilters={handleClearFilters}
        isFullScreen={isMobile}
        showCloseButton
      >
        <div className="flex flex-col gap-4">
          <SelectTransactionPeriod
            value={tempPeriod}
            onChange={setTempPeriod}
          />
          <SelectTransactionType
            value={tempSubtype}
            onChange={setTempSubtype}
          />
        </div>
      </FilterTransactionsDialog>

      {totalTransactions > 5 && (
        <div className="absolute bottom-0 left-0 w-full bg-white shadow-md">
          <PaginationControls
            currentPage={currentPage}
            totalPages={Math.ceil(totalTransactions / transactionsPerPage)}
            onPageChange={changePage}
          />
        </div>
      )}
    </div>
  );
}

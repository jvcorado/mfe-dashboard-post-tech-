"use client";

import React, { useState, useEffect } from "react";
import { Pencil, Trash2, Loader } from "lucide-react";

import TransactionItem from "@/components/transactionItem";
import ActionButton from "@/components/actionButton";
import EditTransactionDialog from "@/components/editTransactionDialog";
import { useAuth } from "@/context/AuthContext";
import { AccountService } from "@/services/AccountService";
import { TransactionService } from "@/services/TransactionService";
import { Transaction } from "@/models/Transaction";
import { TransactionType } from "@/models/TransactionType";

type EditableTransaction = {
  id?: number;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
};

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

  // Buscar transações quando accounts mudar
  useEffect(() => {
    const fetchTransactions = async () => {
      // Verificar se accounts existe e tem pelo menos um elemento
      if (!accounts || accounts.length === 0) {
        console.log("Nenhuma conta disponível para buscar transações");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { transactions: accountTransactions } =
          await AccountService.getById(accounts[0].id);
        setTransactions(accountTransactions);
      } catch (error) {
        console.error("Erro ao buscar transações:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [accounts]);

  const handleEditTransaction = () => {
    setIsEditTransactionItem(true);
    setIsDeleteTransactionItem(false);
  };

  const handleDeleteTransaction = () => {
    setIsDeleteTransactionItem(true);
    setIsEditTransactionItem(false);
  };

  const handleSelectTransactionItem = (transaction: Transaction) => {
    setEditableTransaction({
      id: transaction.id,
      description: "Transação editada", // As transactions não têm description no modelo atual
      amount: transaction.amount,
      type: transaction.type,
      date: new Date(transaction.created_at),
    });

    setIsSelectingTransactionItem(true);
  };

  const handleConfirmEditTransaction = async () => {
    if (editableTransaction && editableTransaction.id) {
      // Verificar se accounts existe e tem pelo menos um elemento
      if (!accounts || accounts.length === 0) {
        console.error("Nenhuma conta disponível para atualizar transação");
        return;
      }

      try {
        const transactionType =
          editableTransaction.type === TransactionType.INCOME
            ? "INCOME"
            : "EXPENSE";
        await TransactionService.update(
          editableTransaction.id,
          transactionType,
          editableTransaction.amount
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-fit text-center md:text-left gap-[24px]">
      <div className="flex flex-rol justify-between">
        <h1 className="text-[25px] font-bold">Extrato</h1>
        <div className="flex gap-3">
          <ActionButton
            onClick={handleEditTransaction}
            content={<Pencil size={22} />}
            colors="blue"
            size="default"
          />
          <ActionButton
            onClick={handleDeleteTransaction}
            content={<Trash2 size={22} />}
            colors="blue"
            size="default"
          />
        </div>
      </div>
      {transactions && transactions.length > 0 ? (
        transactions.map((transaction, index) => (
          <div key={transaction.id || index}>
            <div className="flex justify-end">
              {isEditTransactionItem && (
                <ActionButton
                  onClick={() => handleSelectTransactionItem(transaction)}
                  content={<Pencil size={14} />}
                  colors="blue"
                  size="sm"
                />
              )}
              {isDeleteTransactionItem && (
                <ActionButton
                  onClick={() => handleSelectTransactionItem(transaction)}
                  content={<Trash2 size={14} />}
                  colors="blue"
                  size="sm"
                />
              )}
            </div>
            <TransactionItem
              key={transaction.id || index}
              date={new Date(transaction.created_at)}
              transactionDescription={`Transação ${
                transaction.type === TransactionType.INCOME
                  ? "de entrada"
                  : "de saída"
              }`}
              transactionType={transaction.type}
              value={transaction.amount}
            />
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 py-8">
          <p>Nenhuma transação encontrada</p>
        </div>
      )}

      {isSelectingTransactionItem && editableTransaction && (
        <EditTransactionDialog
          open={isSelectingTransactionItem}
          title={`${isEditTransactionItem ? "Editar" : "Deletar"} transação`}
          description={`${
            isEditTransactionItem
              ? "Edite os dados da transação"
              : "Você tem certeza que deseja deletar essa transação?"
          }`}
          onOpenChange={setIsSelectingTransactionItem}
          onConfirmAction={
            isEditTransactionItem
              ? handleConfirmEditTransaction
              : handleConfirmDeleteTransaction
          }
        >
          {isEditTransactionItem && (
            <div className="flex flex-col gap-4 mt-4">
              <div>
                <label className="text-[#47A138] text-[13px] font-bold">
                  Valor
                </label>
                <input
                  type="number"
                  value={editableTransaction.amount}
                  onChange={(e) => {
                    setEditableTransaction((prev) =>
                      prev ? { ...prev, amount: Number(e.target.value) } : prev
                    );
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>
          )}
        </EditTransactionDialog>
      )}
    </div>
  );
}

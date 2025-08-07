import { TransactionType } from "@/models/TransactionType";

export const transactionTypes: { label: string; type: TransactionType, subtype: string }[] = [
  { label: "DOC/TED", type: TransactionType.EXPENSE, subtype: "DOC_TED" },
  { label: "Boleto", type: TransactionType.EXPENSE, subtype: "BOLETO" },
  { label: "Câmbio de Moeda", type: TransactionType.INCOME, subtype: "CAMBIO" },
  { label: "Empréstimo e Financiamento", type: TransactionType.INCOME, subtype: "EMPRESTIMO" },
  { label: "Depósito", type: TransactionType.INCOME, subtype: "DEPOSITO" },
  { label: "Transferência", type: TransactionType.EXPENSE, subtype: "TRANSFERENCIA" },
  { label: "Restaurante", type: TransactionType.EXPENSE, subtype: "RESTAURANTE" },
  { label: "Transporte", type: TransactionType.EXPENSE, subtype: "TRANSAPORTE" },
  { label: "Salário", type: TransactionType.INCOME, subtype: "SALARIO" },
  { label: "Reembolso", type: TransactionType.INCOME, subtype: "REEMBOLSO" },
  { label: "Cashback", type: TransactionType.INCOME, subtype: "CASHBACK" },
];
import { TransactionType, TransactionSubtype } from "@/models/TransactionType";

export const transactionTypes: { label: string; type: TransactionType, subtype: string  }[] = [
  { label: "DOC/TED", type: TransactionType.EXPENSE, subtype: TransactionSubtype.DOC_TED },
  { label: "Boleto", type: TransactionType.EXPENSE, subtype: TransactionSubtype.BOLETO },
  { label: "Câmbio de Moeda", type: TransactionType.INCOME, subtype: TransactionSubtype.CAMBIO },
  { label: "Empréstimo e Financiamento", type: TransactionType.INCOME, subtype: TransactionSubtype.EMPRESTIMO },
  { label: "Depósito", type: TransactionType.INCOME, subtype: TransactionSubtype.DEPOSITO },
  { label: "Transferência", type: TransactionType.EXPENSE, subtype: TransactionSubtype.TRANSFERENCIA },
];
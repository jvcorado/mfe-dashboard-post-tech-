import { useAuth } from "@/context/AuthContext";

export const useTransactionUpdate = () => {
    const { updateAfterTransaction } = useAuth();

    const handleTransactionSuccess = async () => {
        try {
            await updateAfterTransaction();
        } catch (error) {
            console.error("Erro ao atualizar dados após transação:", error);
        }
    };

    return { handleTransactionSuccess };
}; 
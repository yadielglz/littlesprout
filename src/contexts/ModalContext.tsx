import { createContext, useContext, useState, ReactNode } from 'react';
import { ActionType } from '../components/UnifiedActionModal';

interface ModalContextType {
  isModalOpen: boolean;
  actionType: ActionType | null;
  openModal: (type: ActionType) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  const openModal = (type: ActionType) => {
    setActionType(type);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActionType(null);
  };

  return (
    <ModalContext.Provider value={{ isModalOpen, actionType, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}; 
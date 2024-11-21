
interface ModalProps {
    className?: string;
    children: React.ReactNode;
}

function Modal({
    className='',
    children
}:ModalProps) {
    return (
        <div
            className={
                'modal center app-drag' + className
            }
        >
            {children}
        </div>
    );
}

export default Modal;
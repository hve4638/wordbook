import { Flex } from 'components/utils';
import Modal from './modals';
import GoogleFontIconButton from 'components/GoogleFontIconButton';
import { useEffect, useRef } from 'react';

interface EditWordMeaningModalProps {
    meaning: WordMeaning;
    onCancel: () => void;
    onSubmit: (meaning:WordMeaning) => void;
}

function EditWordMeaningModal(props:EditWordMeaningModalProps) {
    const fromTypeInputRef = useRef<HTMLInputElement>(null);
    const toInputRef = useRef<HTMLInputElement>(null);

    useEffect(()=>{
        // Ctrl + S : 북마크 토글
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                props.onCancel()
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    });

    return (
        <Modal
            className=''
        >
            <div
                className='app-nodrag modal-box column edit-word-meaning-modal'
            >
                <span
                    className='row'
                    style={{
                        marginBottom: '8px'
                    }}
                >
                    <span
                        style={{
                            width: '2em'
                        }}
                    >뜻</span>
                    <input
                        ref={toInputRef}
                        className='flex'
                        style={{
                            marginLeft: '0.5em',
                            padding : '0.3em'
                        }}
                        type='text'
                    />
                </span>
                <span
                    className='row'
                    style={{
                        marginBottom: '8px'
                    }}
                >
                    <span
                        style={{
                            width: '2em',
                        }}
                    >품사</span>
                    <input
                        type='text'
                        ref={fromTypeInputRef}
                        className='flex'
                        style={{
                            marginLeft: '0.5em',
                            padding : '0.3em'
                        }}
                    />
                </span>
                
                <div
                    className='row'
                >
                    <Flex/>
                    <GoogleFontIconButton
                        className='clickable'
                        value='close'
                        onClick={()=>props.onCancel()}
                    />
                    <GoogleFontIconButton
                        className='clickable'
                        value='check'
                        onClick={()=>{
                            const fromType = fromTypeInputRef.current?.value ?? '';
                            const to = toInputRef.current?.value ?? '';
                            console.log(fromType, to);

                            if (fromType.length === 0 && to.length === 0) {
                                return;
                            }
                            const newMeaning:WordMeaning = {
                                ...props.meaning,
                                fromType,
                                to,
                            };

                            props.onSubmit(newMeaning);
                        }}
                    />
                </div>
                
            </div>
        </Modal>
    )
}

export default EditWordMeaningModal;
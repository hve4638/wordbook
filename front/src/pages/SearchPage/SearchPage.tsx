import GoogleFontIconButton from 'components/GoogleFontIconButton';
import GoogleFontIcon from 'components/GoogleFontIcon';

function SearchPage() {
    return (
        <div
            className='app-drag theme-dark column fill'
        >
            <div className='noflex row' style={{margin:'6px'}}>
                <div className='flex'></div>
                <div>
                    <GoogleFontIconButton
                        className='app-nodrag undraggable'
                        value='menu'
                    />
                </div>
            </div>
            <div className='row main-center'>
                <div
                    className='app-nodrag row'
                    style={{
                        width: '80%',
                        height: '1rem',
                        margin: '8px',
                    }}
                >
                    <input
                        className='flex'
                        style={{
                            padding: '4px',
                            fontSize: '0.5rem',
                        }}
                    />
                    <button
                        style={{
                            marginLeft: '6px',
                            width : '1rem',
                            height : '1rem',
                        }}
                    >
                        <GoogleFontIcon
                            style={{fontSize:'0.8rem'}}
                            value='send'
                        />
                    </button>
                </div>
            </div>
            <div id='loading' className='flex row center'></div>
            <footer className='row noflex' style={{margin:'6px'}}>
                <GoogleFontIconButton
                    className='app-nodrag undraggable noflex'
                    value='quiz'
                />
                <div className='flex'/>
                <GoogleFontIconButton
                    className='app-nodrag undraggable noflex'
                    value='settings'
                />
            </footer>
        </div>
    )
}

export default SearchPage;
import React, { useState, useRef } from 'react';

  const LinkSharing = () => {
    const textInputRef = useRef(null);
    const [copyButtonText, setCopyButtonText] = useState('Copy link');

    return (
      <div className='link-sharing'>
        <input
          type='text'
          value={window.location.href}
          ref={textInputRef}
          onFocus={(event) => event.target.select()}
          readOnly
        />
        <button
          className='submit-btn'
          type='button'
          onClick={(event) => {
            textInputRef.current.select();
            document.execCommand('copy');
            event.target.focus();
            setCopyButtonText('Copied');
            setTimeout(() => setCopyButtonText('Copy link'), 500);
          }}
        >
          {copyButtonText}
        </button>
      </div>
    )
  }

  export default LinkSharing;
import React from 'react'
import dynamic from 'next/dynamic';

const Preview = ({ data, onEdit }) =>  {
    return(
        <div style={{ border: '1px solid #ccc', padding: '18px', marginTop: '20px', width: '600px' }} className='editButton'>
            <h3>Preview</h3>
            {Object.entries(data).map(([key, value]) => (
                <p key={key}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {JSON.stringify(value)}
                </p>
            ))}
            <button onClick={onEdit} style={{ border: 'none', marginTop: '20px', backgroundColor: '#fff', color: '#8a59ca', padding: '7px 20px' }} >Edit</button>
        </div>
    );
};

export default dynamic (() => Promise.resolve(Preview), {ssr: false});
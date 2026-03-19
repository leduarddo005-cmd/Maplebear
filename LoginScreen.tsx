// Updated import statement for LoginScreen.tsx
import React from 'react';

// Use a placeholder image instead of the Figma asset  
const imgMapleBear1 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA
AAAACAIAAA9E6gYAAAAFElEQVR42mJ8z8D7wMGAIiAgIKjD6eAAAAAElFTkSuQmCC';

const LoginScreen = () => {
    return (
        <div>
            <img src={imgMapleBear1} alt="Maple Bear" />
        </div>
    );
};

export default LoginScreen;
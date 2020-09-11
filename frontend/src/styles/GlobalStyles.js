import { createGlobalStyle } from 'styled-components'

export const GlobalStyles = createGlobalStyle`
    #root{
        height: 100vh;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: 'Roboto', sans-serif;  

        background: rgba(209, 209, 209, 0.43);      

        --primary-color: rgb(242,242,242);
        --highlight-color: rgb(19,123,174);
        --text-color: #c3c3c3;
    }
    *,body{
        margin:0;
        padding: 0;        
    }
`;
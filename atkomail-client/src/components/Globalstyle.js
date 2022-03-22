import { createGlobalStyle} from "styled-components"
export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }

  .ui.menu {
      background-color: ${({ theme }) => theme.header};
  }

  .ui.menu .item {
    color: ${({ theme }) => theme.text};
  }
  .ui.form input[type="text"],.ui.form input[type="text"]:focus, .ui.selection.dropdown, .ui.dropdown .menu, .ui.menu .ui.dropdown .menu > .item, .ui.menu .ui.dropdown .menu > .active.item, .ui.selection.visible.dropdown > .text:not(.default) {
    background-color: ${({ theme }) => theme.background};
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text} !important;
  }

  .brandText{
    color: ${({ theme }) => theme.brand} !important;
  }

  .brandColor{
    background-color: ${({ theme }) => theme.brand} !important;
  }
  `

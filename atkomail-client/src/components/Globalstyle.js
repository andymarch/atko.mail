import { createGlobalStyle} from "styled-components"
export const GlobalStyles = createGlobalStyle`
  body {
    background-color: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text};
    font-family: Tahoma, Helvetica, Arial, Roboto, sans-serif;
    transition: all 0.50s linear;
  }

  .ui.inverted.dimmer .ui.loader {
    color: ${({ theme }) => theme.text};
  }

  .ui.inverted.dimmer .ui.loader::after {
    border-color: ${({ theme }) => theme.brand} transparent transparent;
  }

  .ui.inverted.dimmer {
      background-color: ${({ theme }) => theme.background};
  }

  .ui.menu {
      background-color: ${({ theme }) => theme.header};
  }

  .ui.menu .item {
    color: ${({ theme }) => theme.text};
  }

  .ui.link.menu .item:hover, .ui.menu .dropdown.item:hover, .ui.menu .link.item:hover, .ui.menu a.item:hover{
    color: ${({ theme }) => theme.brand};
  }

  .ui.form input[type="text"],.ui.form input[type="text"]:focus, .ui.selection.dropdown, .ui.dropdown .menu, .ui.menu .ui.dropdown .menu > .item, .ui.menu .ui.dropdown .menu > .active.item, .ui.selection.visible.dropdown > .text:not(.default) {
    background-color: ${({ theme }) => theme.background};
    background: ${({ theme }) => theme.background};
    color: ${({ theme }) => theme.text} !important;
  }

  .ui.list .list > .item a.header, .ui.list > .item a.header {
    color: ${({ theme }) => theme.brand} !important;
  }

  .ui.list .list > .item .description, .ui.list > .item .description {
    color: ${({ theme }) => theme.text};
  }

  .brandText{
    color: ${({ theme }) => theme.brand} !important;
  }

  .brandColor{
    background-color: ${({ theme }) => theme.brand} !important;
  }
  `

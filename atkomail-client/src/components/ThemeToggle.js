import React from 'react'
import { func, string } from 'prop-types';
import { Checkbox, Icon } from 'semantic-ui-react'

const Toggle = ({theme,  toggleTheme }) => {
    return (
        <div class="ui fitted toggle checkbox">
            <Icon name='sun' />/ <Icon name="moon"/><Checkbox toggle onClick={toggleTheme}/>
        </div>
    );
};
Toggle.propTypes = {
    theme: string.isRequired,
    toggleTheme: func.isRequired,
}
export default Toggle;

import React from 'react';
import styled from 'styled-components';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  className?: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, className }) => {
  return (
    <StyledWrapper className={className}>
      <label className="switch-button" htmlFor="switch">
        <div className="switch-outer">
          <input id="switch" type="checkbox" checked={checked} onChange={onChange} />
          <div className="button">
            <span className="button-toggle" />
            <span className="button-indicator" />
          </div>
        </div>
      </label>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .switch-button {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: center;
    justify-content: center;
    justify-content: center;
    margin: auto;
    height: 34px; /* Update 1 */
  }

  .switch-button .switch-outer {
    height: 100%;
    background: #252532;
    width: 60px; /* Update 2 */
    border-radius: 165px;
    -webkit-box-shadow: inset 0px 5px 10px 0px #16151c, 0px 3px 6px -2px #403f4e;
    box-shadow: inset 0px 5px 10px 0px #16151c, 0px 3px 6px -2px #403f4e;
    border: 1px solid #32303e;
    padding: 2px; /* Update 2 */
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .switch-button .switch-outer input[type="checkbox"] {
    opacity: 0;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    position: absolute;
  }

  .switch-button .switch-outer .button-toggle {
    height: 30px; /* Update 3 */
    width: 30px; /* Update 3 */
    background: -webkit-gradient(
      linear,
      left top,
      left bottom,
      from(#3b3a4e),
      to(#272733)
    );
    background: -o-linear-gradient(#3b3a4e, #272733);
    background: linear-gradient(#3b3a4e, #272733);
    border-radius: 100%;
    -webkit-box-shadow: inset 0px 5px 4px 0px #424151, 0px 4px 15px 0px #0f0e17;
    box-shadow: inset 0px 5px 4px 0px #424151, 0px 4px 15px 0px #0f0e17;
    position: relative;
    z-index: 2;
    -webkit-transition: left 0.3s ease-in;
    -o-transition: left 0.3s ease-in;
    transition: left 0.3s ease-in;
    left: 0;
  }

  .switch-button
    .switch-outer
    input[type="checkbox"]:checked
    + .button
    .button-toggle {
    left: 45%; /* Update 5 */
  }

  .switch-button
    .switch-outer
    input[type="checkbox"]:checked
    + .button
    .button-indicator {
    -webkit-animation: indicator 1s forwards;
    animation: indicator 1s forwards;
  }

  .switch-button .switch-outer .button {
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    position: relative;
    -webkit-box-pack: justify;
    justify-content: space-between;
  }

  .switch-button .switch-outer .button-indicator {
    height: 15px; /* Update 4 */
    width: 15px; /* Update 4 */
    top: 50%;
    -webkit-transform: translateY(-50%);
    transform: translateY(-50%);
    border-radius: 50%;
    border: 3px solid #ef565f;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    right: 10px;
    position: relative;
  }

  @-webkit-keyframes indicator {
    30% {
      opacity: 0;
    }

    0% {
      opacity: 1;
    }

    100% {
      opacity: 1;
      border: 3px solid #60d480;
      left: -68%;
    }
  }

  @keyframes indicator {
    30% {
      opacity: 0;
    }

    0% {
      opacity: 1;
    }

    100% {
      opacity: 1;
      border: 3px solid #60d480;
      left: -68%;
    }
  }
`;

export default ToggleSwitch;


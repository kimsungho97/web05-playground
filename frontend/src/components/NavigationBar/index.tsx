/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-template-curly-in-string */
import React from 'react';
import { useRecoilState } from 'recoil';

import styled from 'styled-components';

import currentModalState from '../../store/currentModalState';

const icons = [
    'voiceChat',
    'fileUpload',
    'buildBuilding',
    'buildObject',
    'users',
    'chat',
    'setting',
];

const NavigationBar = () => {
    const [currentModal, setCurrentModal] = useRecoilState(currentModalState);
    return (
        <FixedDiv>
            <SideDiv>
                <Icons
                    src="/assets/logout.png"
                    onClick={() => {
                        console.log('나가기');
                    }}
                />
                <LogDiv>로그</LogDiv>
            </SideDiv>
            <img src="/assets/navLogo.png" width="90px" height="80px" />
            <SideDiv>
                {icons.map((icon) => {
                    return (
                        <Icons
                            key={icon}
                            src={`/assets/${icon}.png`}
                            onClick={() => {
                                if (currentModal === icon) setCurrentModal('none');
                                else setCurrentModal(icon);
                            }}
                        />
                    );
                })}
            </SideDiv>
        </FixedDiv>
    );
};

export default NavigationBar;

const FixedDiv = styled.div`
    position: fixed;
    z-index: 3;

    width: 100vw;
    height: 80px;
    left: 0;
    bottom: 0;
    background: #f1ea65;

    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
`;

const Icons = styled.img`
    width: 40px;
    height: 40px;
`;

const SideDiv = styled.div`
    width: 45vw;
    height: 80px;

    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
`;

const LogDiv = styled.div`
    width: 35vw;
    height: 30px;
    background-color: #c4c4c4;
    border-radius: 20px;
    text-align: center;
    line-height: 30px;
`;

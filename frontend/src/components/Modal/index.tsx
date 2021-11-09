import React from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';

import styled from 'styled-components';

import currentModalState from '../../store/currentModalState';
import selectedBuildingState from '../../store/selectedBuildingState';

interface customEventTarget extends EventTarget {
    src: string;
}

interface customMouseEvent extends React.MouseEvent<HTMLButtonElement, MouseEvent> {
    target: customEventTarget;
}

const Modal = () => {
    const [currentModal, setCurrentModal] = useRecoilState(currentModalState);
    const setSelectedBuilding = useSetRecoilState(selectedBuildingState);

    const selectBuilding = (e: customMouseEvent) => {
        const selectedBuildingInfo = {
            buildingSrc: e.target.src,
            locationX: -1,
            locationY: -1,
            isLocated: false,
        };
        setSelectedBuilding(selectedBuildingInfo);
    };

    return (
        <ModalDiv>
            <BackBtn src="/assets/nextbtn.png" onClick={() => setCurrentModal('none')} />
            {currentModal}
            <button type="button" onClick={selectBuilding}>
                <img src="/assets/home.png" alt="빌드 가능한 빌딩 이미지" />
            </button>
        </ModalDiv>
    );
};

export default Modal;

const ModalDiv = styled.div`
    position: fixed;
    z-index: 2;

    height: 100vh;
    width: 400px;
    background: #c4c4c4;
    right: 0;
    top: 0px;
    border: 3px solid black;
`;

const BackBtn = styled.img`
    padding: 10px;
    width: 30px;
    height: 30px;
`;

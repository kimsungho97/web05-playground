/* eslint-disable react/no-unknown-property */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { socketClient } from '../../socket/socket';

import buildBuildingState from '../../store/buildBuildingState';
import userState from '../../store/userState';
import { NONE } from '../../utils/constants';
import { ActiveModal } from '../../utils/model';

interface customEventTarget extends EventTarget {
    value: string;
}

interface customMouseEvent extends React.MouseEvent<HTMLInputElement, MouseEvent> {
    target: customEventTarget;
}

interface customSetFunctions {
    [FunctionType: string]: React.Dispatch<React.SetStateAction<string>>;
}

const setBuildingModal = React.memo(() => {
    const [description, setDescription] = useState('');
    const [range, setRange] = useState('private');
    const [password, setPassword] = useState('');
    const [buildBuilding, setBuildBuilding] = useRecoilState(buildBuildingState);
    const user = useRecoilValue(userState);

    const setFunctions: customSetFunctions = {
        description: setDescription,
        password: setPassword,
    };

    const changed = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFunctions[e.target.id](e.target.value);
    };

    const rangeClicked = (e: customMouseEvent) => {
        const { value } = e.target;
        setRange(value);
    };

    const resetInput = () => {
        setDescription('');
        setRange('private');
        setPassword('');
    };

    const cancleBuild = () => {
        const selectedBuildingInfo = {
            src: 'none',
            id: NONE,
            roomId: NONE,
            locationX: NONE,
            locationY: NONE,
            isLocated: false,
            isData: false,
        };
        setBuildBuilding(selectedBuildingInfo);
        resetInput();
    };

    const completeBuild = () => {
        if (description === '') alert('값을 모두 입력해주세요');
        else {
            const buildingInfo = {
                x: buildBuilding.locationX,
                y: buildBuilding.locationY,
                uid: user.id,
                description,
                scope: range,
                password,
                imageUrl: buildBuilding.src,
            };
            socketClient.emit('buildBuilding', buildingInfo);

            const selectedBuildingInfo = {
                src: 'none',
                id: NONE,
                roomId: NONE,
                locationX: -1,
                locationY: -1,
                isLocated: false,
                isData: false,
            };
            setBuildBuilding(selectedBuildingInfo);
            alert('추가되었습니다.');
            resetInput();
        }
    };

    return (
        <ModalDiv active={buildBuilding.isLocated}>
            <ElementDiv>
                <TitleTag>설명</TitleTag>
                <InputDescription id="description" value={description} onChange={changed} />
            </ElementDiv>
            <ElementDiv>
                <TitleTag>공개여부</TitleTag>
                <RadioWrapper>
                    <div>
                        <input
                            type="radio"
                            name="range"
                            value="private"
                            id="range"
                            checked={range === 'private'}
                            onClick={rangeClicked}
                        />
                        private
                    </div>
                    <div>
                        <input
                            type="radio"
                            name="range"
                            value="public"
                            id="range"
                            checked={range === 'public'}
                            onClick={rangeClicked}
                        />
                        public
                    </div>
                </RadioWrapper>
            </ElementDiv>
            <ElementDiv>
                <TitleTag>비밀번호</TitleTag>
                <InputPassword
                    id="password"
                    onChange={changed}
                    readOnly={range === 'public'}
                    value={password}
                    type="password"
                />
            </ElementDiv>
            <BtnWrapper>
                <StyledBtn onClick={cancleBuild}>취소</StyledBtn>
                <StyledBtn onClick={completeBuild}>확인</StyledBtn>
            </BtnWrapper>
        </ModalDiv>
    );
});

export default setBuildingModal;

const ModalDiv = styled.div<ActiveModal>`
    position: absolute;
    z-index: 3;

    top: 50%;
    left: 50%;
    width: 400px;
    height: 400px;
    background: #c4c4c4;
    margin: -240px 0 0 -200px;

    display: ${(props) => (props.active === true ? 'flex' : 'none')};
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    border-radius: 20px;
    border: 3px solid black;
`;

const ElementDiv = styled.div`
    width: 200px;
`;

const TitleTag = styled.p`
    margin: 0 0 10px 0;
`;

const InputDescription = styled.textarea`
    border: 0;
    height: 40px;
    width: 200px;
    resize: none;
`;

const InputPassword = styled.input`
    border: 0;
    border-bottom: black 1px solid;
    background-color: #c4c4c4;
    height: 20px;
    width: 200px;
`;

const BtnWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 300px;
`;

const StyledBtn = styled.button`
    height: 40px;
    width: 70px;
    background-color: #c4c4c4c4;
    border-radius: 20px;
`;

const RadioWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

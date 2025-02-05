/* eslint-disable react/no-unknown-property */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
import axios from 'axios';
import React, { useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useMutation } from '@apollo/client';
import { socketClient } from '../../socket/socket';

import buildObjectState from '../../store/buildObjectState';
import currentWorldState from '../../store/currentWorldState';
import userState from '../../store/userState';

import { DEFAULT_INDEX, NONE } from '../../utils/constants';

import { ActiveModal, IUser, IWorld } from '../../utils/model';
import { getUploadUrl } from '../../utils/query';

const setBuildingModal = React.memo(() => {
    const worldInfo = useRecoilValue<IWorld>(currentWorldState);
    const userInfo = useRecoilValue<IUser>(userState);
    const [buildObject, setBuildObject] = useRecoilState(buildObjectState);
    const [getSignedUrl] = useMutation(getUploadUrl);
    const [file, setFile] = useState<File>();

    const cancleBuild = () => {
        const selectedObjectInfo = {
            src: 'none',
            id: NONE,
            roomId: NONE,
            locationX: NONE,
            locationY: NONE,
            isLocated: false,
            isData: false,
        };
        setBuildObject(selectedObjectInfo);
        setFile(undefined);
    };

    const completeBuild = async () => {
        const objectInfo = {
            x: buildObject.locationX,
            y: buildObject.locationY,
            bid: buildObject.roomId,
            imageUrl: buildObject.src,
            fileUrl: '',
        };

        if (file === undefined) socketClient.emit('buildObject', objectInfo);
        else {
            const url = [worldInfo.id, buildObject.roomId, userInfo.id, Date.now(), file.name].join(
                '/',
            );
            const preSignedUrl: string = (await getSignedUrl({ variables: { fileUrl: url } })).data
                .getUploadUrl;

            await axios.put(preSignedUrl, file, {
                headers: { 'Content-Type': file.type, 'x-amz-acl': 'public-read' },
            });

            socketClient.emit('buildObject', { ...objectInfo, fileUrl: url });
        }

        const selectedObjectInfo = {
            src: 'none',
            id: NONE,
            roomId: NONE,
            locationX: NONE,
            locationY: NONE,
            isLocated: false,
            isData: false,
        };
        setBuildObject(selectedObjectInfo);
        alert('추가되었습니다.');
        setFile(undefined);
    };

    const makeFileList = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        if (target.files === null) return;
        setFile(target.files[DEFAULT_INDEX]);
    };

    return (
        <ModalDiv active={buildObject.isLocated}>
            <BtnWrapper>
                <StyledBtn onClick={cancleBuild}>취소</StyledBtn>
                <StyledInput
                    id="uploadFile"
                    type="file"
                    accept=".doc,.docx,.pdf,image/*"
                    onChange={makeFileList}
                />
                <StyledBtn>
                    <label htmlFor="uploadFile">업로드</label>
                </StyledBtn>
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

const StyledInput = styled.input`
    display: none;
`;

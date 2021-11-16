/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/alt-text */
import { useMutation } from '@apollo/client';
import React, { useEffect, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import { useRecoilState, useRecoilValue } from 'recoil';

import styled from 'styled-components';
import currentWorldState from '../../store/currentWorldState';
import userState from '../../store/userState';
import { useSlide } from '../../utils/hooks/useSlide';
import { ICharacter, IWorld } from '../../utils/model';
import { setUserInfo } from '../../utils/query';

export function CharacterSelector({
    props,
    characterList,
}: {
    props: RouteComponentProps;
    characterList: ICharacter[];
}) {
    const [character, setCharacter] = useState<ICharacter>(characterList[0]);
    const [current, nextClick, prevClick] = useSlide(characterList, setCharacter);
    const [updateUser, { data, loading, error }] = useMutation(setUserInfo);
    const [user, setUser] = useRecoilState(userState);
    const nicknameInput = useRef(user.nickname);

    const redirectWorld = async (event: React.MouseEvent) => {
        if (nicknameInput.current === null) return;
        event.preventDefault();
        const result = await updateUser({
            variables: {
                setUserInfoId: user.id,
                nickname: nicknameInput.current,
                imageUrl: current.imageUrl,
            },
        });
        setUser({ ...user, nickname: nicknameInput.current, imageUrl: current.imageUrl });
        props.history.push('/world');
    };

    return (
        <>
            <Selector>
                <img src="/assets/prevbtn.png" onClick={prevClick} height="50px" />
                <Character thumbnail={character.imageUrl} />
                <img src="/assets/nextbtn.png" onClick={nextClick} height="50px" />
            </Selector>
            <Wrapper>
                <Blank />
                <Nickname type="text" value={nicknameInput.current} />
                <SelectBtn onClick={(e) => redirectWorld(e)}>선택</SelectBtn>
            </Wrapper>
        </>
    );
}

const Character = styled.div<{ thumbnail: string }>`
    height: 400px;
    width: 400px;
    text-align: center;
    line-height: 400px;
    background-image: url('${(props) => props.thumbnail}');
    background-color: #c4c4c4;
    background-size: cover;
    border-radius: 20px;

    font-family: Roboto;
    font-style: normal;
    font-weight: bold;
    font-size: 80px;
`;

const Selector = styled.div`
    display: flex;
    width: 600px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const Wrapper = styled.div`
    display: flex;
    width: 800px;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`;

const Blank = styled.div`
    width: 300px;
`;

const Nickname = styled.input`
    width: 400px;
    height: 60px;

    border-radius: 20px;
    background-color: #ffef6f;

    font-family: Roboto;
    font-style: normal;
    font-weight: 150;
    font-size: 40px;
    font-weight: 500;
    text-align: center;
`;

const SelectBtn = styled.div`
    margin: 40px;
    height: 60px;
    width: 200px;
    background-color: #c4c4c4;
    text-align: center;
    line-height: 60px;
    border-radius: 20px;

    font-family: Roboto;
    font-style: normal;
    font-weight: 150;
    font-size: 40px;
    font-weight: 500;
`;

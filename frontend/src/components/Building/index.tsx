/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable react/destructuring-assignment */
import React, { useRef, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import styled from 'styled-components';

import { socketClient } from '../../socket/socket';

import userState from '../../store/userState';
import buildBuildingState from '../../store/buildBuildingState';

import { IBuilding, IProps } from '../../utils/model';

const commonWidth = 70;
const commonHeight = 50;
const tileSize = 32;
const OBJECT = 1;
let ctx: CanvasRenderingContext2D | null;
let checkingCtx: CanvasRenderingContext2D | null;
const buildingImageCache = new Map();

const objCanvas = document.createElement('canvas');
const objctx = objCanvas.getContext('2d');
objCanvas.width = commonWidth * tileSize;
objCanvas.height = commonHeight * tileSize;

const Building = (props: IProps) => {
    const { layers, buildingList } = props;
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const checkingRef = useRef<HTMLCanvasElement>(null);
    const [buildBuilding, setBuildBuilding] = useRecoilState(buildBuildingState);
    const [buildingData, setBuildingData] = useState(new Array(commonWidth * commonHeight).fill(0));
    const user = useRecoilValue(userState);

    let cnt = 0;

    const objectLayer = layers[OBJECT].data;

    let buildTargetX = -1;
    let buildTargetY = -1;

    useEffect(() => {
        if (socketClient === undefined) return;
        socketClient.on('buildBuilding', (data: IBuilding) => {
            drawOriginBuildings(data);
            drawObjCanvas();
        });
        return () => {
            socketClient.removeListener('buildBuilding');
        };
    }, [socketClient, user]);

    useEffect(() => {
        const canvas: HTMLCanvasElement | null = canvasRef.current;
        const checkingCanvas: HTMLCanvasElement | null = checkingRef.current;
        if (canvas === null || checkingCanvas === null) {
            return;
        }

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        checkingCanvas.width = window.innerWidth;
        checkingCanvas.height = window.innerHeight;

        ctx = canvas.getContext('2d');
        checkingCtx = checkingCanvas.getContext('2d');

        if (buildingList.length !== 0 && buildingList[0].id !== -1) {
            buildingList.forEach((building) => {
                fillBuildingPosition(building);
                drawOriginBuildings(building);
            });
            drawObjCanvas();
        }
    }, [buildingList]);

    useEffect(() => {
        window.addEventListener('mousedown', processBuild);
        window.addEventListener('mousemove', updatePosition);

        return () => {
            window.removeEventListener('mousedown', processBuild);
            window.removeEventListener('mousemove', updatePosition);
        };
    }, [buildBuilding]);

    useEffect(() => {
        drawObjCanvas();
    }, [user]);

    const fillBuildingPosition = (building: IBuilding) => {
        const { x, y } = building;
        const buildingSize = 2;
        for (let i = x - buildingSize; i < x + buildingSize; i++) {
            for (let j = y - buildingSize; j < y + buildingSize; j++) {
                const index = getIndex(i, j);
                buildingData[index] = 1;
            }
        }
    };

    const isValidPosition = () => {
        return (
            buildTargetX >= 0 &&
            buildTargetX <= window.innerWidth &&
            buildTargetY >= 0 &&
            buildTargetY <= window.innerHeight
        );
    };

    const processBuild = () => {
        if (
            !buildBuilding.isBuilding &&
            buildBuilding.buildingSrc !== 'none' &&
            !buildBuilding.isLocated
        ) {
            setBuildBuilding({
                ...buildBuilding,
                isBuilding: true,
            });
            return;
        }

        const width = Math.floor(window.innerWidth / 2);
        const height = Math.floor(window.innerHeight / 2);
        const dx = width - (width % tileSize);
        const dy = height - (height % tileSize);
        let layerX = user.x - dx / tileSize;
        let layerY = user.y - dy / tileSize;

        if (layerX < 0) layerX = 0;
        if (layerY < 0) layerY = 0;
        if (layerX > 70) layerX = 70;
        if (layerY > 50) layerY = 50;

        if (
            isValidPosition() &&
            isPosssibleArea(buildTargetX, buildTargetY) &&
            checkingCtx !== null
        ) {
            setBuildBuilding({
                ...buildBuilding,
                locationX: buildTargetX + layerX,
                locationY: buildTargetY + layerY,
                isLocated: true,
                isBuilding: false,
            });
            checkingCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        }
    };

    const updatePosition = (e: MouseEvent) => {
        if (!checkingCtx || !buildBuilding.isBuilding) return;

        buildTargetX = Math.floor(e.pageX / tileSize);
        buildTargetY = Math.floor(e.pageY / tileSize);

        checkingCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        drawBuildingOfMove();
        drawPossibleBox();
    };

    const drawBuildingOfMove = () => {
        if (!checkingCtx) return;

        checkingCtx.globalAlpha = 1.0;
        const buildingOutputSize = tileSize * 4;
        const buildObject = new Image();
        buildObject.src = buildBuilding.buildingSrc;
        checkingCtx.drawImage(
            buildObject,
            buildTargetX * tileSize - buildingOutputSize / 2,
            buildTargetY * tileSize - buildingOutputSize / 2,
            buildingOutputSize,
            buildingOutputSize,
        );
    };

    const drawPossibleBox = () => {
        if (!checkingCtx) return;

        const possibleAreaOutputSize = tileSize * 5;
        checkingCtx.fillStyle = isPosssibleArea(buildTargetX, buildTargetY) ? '#C6FCAC' : '#F35F5F';
        checkingCtx.globalAlpha = 0.5;
        checkingCtx.fillRect(
            buildTargetX * tileSize - possibleAreaOutputSize / 2,
            buildTargetY * tileSize - possibleAreaOutputSize / 2,
            possibleAreaOutputSize,
            possibleAreaOutputSize,
        );
    };

    const getIndex = (x: number, y: number) => {
        return y * commonWidth + x;
    };

    const isPosssibleArea = (col: number, row: number) => {
        const halfOfBuildingTileCount = 2;
        for (let i = col - halfOfBuildingTileCount; i < col + halfOfBuildingTileCount; i++) {
            for (let j = row - halfOfBuildingTileCount; j < row + halfOfBuildingTileCount; j++) {
                const objectVal = objectLayer[getIndex(i, j)];
                const buildingVal = buildingData[getIndex(i, j)];
                if (objectVal !== 0 || buildingVal !== 0) {
                    return false;
                }
            }
        }
        return true;
    };

    const drawOriginBuildings = (building: IBuilding) => {
        if (!ctx) return;
        if (!objctx) return;

        const width = Math.floor(window.innerWidth / 2);
        const height = Math.floor(window.innerHeight / 2);
        const dx = width - (width % tileSize);
        const dy = height - (height % tileSize);
        let layerX = user.x - dx / tileSize;
        let layerY = user.y - dy / tileSize;

        if (layerX < 0) layerX = 0;
        if (layerY < 0) layerY = 0;
        if (layerX > 70) layerX = 70;
        if (layerY > 50) layerY = 50;

        // Todo - 캐싱이미지의 경우 오프스크린에 미리 그려서 캔버스에 입히는 식으로 성능 개선을 해보자
        const cachingImage = buildingImageCache.get(building.imageUrl);
        if (cachingImage) {
            const buildingOutputSize = tileSize * 4;
            objctx.drawImage(
                cachingImage,
                building.x * tileSize - buildingOutputSize / 2,
                building.y * tileSize - buildingOutputSize / 2,
                buildingOutputSize,
                buildingOutputSize,
            );
            cnt++;
            if (cnt === buildingList.length) {
                drawObjCanvas();
            }
        } else {
            const buildingObject = new Image();
            buildingObject.src = building.imageUrl;
            buildingObject.onload = () => {
                if (!ctx) return;
                if (!objctx) return;
                buildingImageCache.set(building.imageUrl, buildingObject);
                const buildingOutputSize = tileSize * 4;

                objctx.drawImage(
                    buildingObject,
                    building.x * tileSize - buildingOutputSize / 2,
                    building.y * tileSize - buildingOutputSize / 2,
                    buildingOutputSize,
                    buildingOutputSize,
                );
                cnt++;
                if (cnt === buildingList.length - 1) {
                    drawObjCanvas();
                }
            };
        }
    };

    const drawObjCanvas = () => {
        if (!ctx) return;
        if (!objctx) return;
        ctx?.clearRect(0, 0, window.innerWidth, window.innerHeight);

        const width = Math.floor(window.innerWidth / 2);
        const height = Math.floor(window.innerHeight / 2);
        const dx = width - (width % tileSize);
        const dy = height - (height % tileSize);

        let layerX = user.x - dx / tileSize;
        let layerY = user.y - dy / tileSize;

        if (layerX < 0) layerX = 0;
        if (layerY < 0) layerY = 0;
        if (layerX > 70) layerX = 70;
        if (layerY > 50) layerY = 50;

        ctx.drawImage(
            objCanvas,
            -layerX * tileSize,
            -layerY * tileSize,
            commonWidth * tileSize,
            commonHeight * tileSize,
        );
    };

    return (
        <>
            <BuildingCanvas id="canvas" ref={canvasRef} />
            <CheckingCanvas id="checkingCanvas" ref={checkingRef} />
        </>
    );
};

export default Building;

const BuildingCanvas = styled.canvas`
    position: absolute;
    z-index: 1;
    margin-left: 0px;
    overflow: hidden;
`;
const CheckingCanvas = styled.canvas`
    position: absolute;
    z-index: 2;
    margin-left: 0px;
    overflow: hidden;
`;

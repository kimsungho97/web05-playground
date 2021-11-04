import React, { useState, useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import currentWorldState from '../../store/currentWorldState';

import WorldBackground from '../../components/WorldMap';

import worldPark from '../../map-files/world-park.json';
import worldWinter from '../../map-files/world-winter.json';

const worldsInfo: any = {
    world1: worldPark,
    world2: worldWinter,
};

const World = ({ history }: any) => {
    const [currentWorld, setCurrentWorld] = useRecoilState(currentWorldState);
    if (currentWorld.name === 'default') {
        history.push('/selectworld');
        return <></>;
    }

    const [mapLayers, setMapLayer] = useState<any>(
        worldsInfo[currentWorld.name].layers,
    );
    useEffect(() => {
        window.onpopstate = () => {
            setCurrentWorld({
                id: 1,
                uid: 1,
                name: 'default',
                port: 1,
                thumbnail: '/assets/world1',
            });
            history.push('/selectworld');
        };
    }, []);

    return <WorldBackground data={mapLayers} />;
};

export default World;

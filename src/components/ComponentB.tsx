import React, { useEffect, useState } from 'react';
import { Select, Button, Spin, Alert, Descriptions, Tag, Typography } from 'antd';

const { Title } = Typography;
const { Option } = Select;
export interface Station {
    id: number;
    stationName: string;
    gegrLat: string;
    gegrLon: string;
    city: {
        id: number;
        name: string;
        commune: {
            communeName: string;
            districtName: string;
            provinceName: string;
        };
    };
    addressStreet: string | null;
}

export interface IndexLevel {
    id: number;
    indexLevelName: string;
}

export interface AirQualityIndex {
    id: number;
    stCalcDate?: string;
    stIndexLevel?: IndexLevel;
    no2CalcDate?: string;
    no2IndexLevel?: IndexLevel;
    no2SourceDataDate?: string;
    o3CalcDate?: string;
    o3IndexLevel?: IndexLevel | null;
    o3SourceDataDate?: string;
    pm10CalcDate?: string;
    pm10IndexLevel?: IndexLevel | null;
    pm10SourceDataDate?: string;
    pm25CalcDate?: string;
    pm25IndexLevel?: IndexLevel | null;
    pm25SourceDataDate?: string | null;
    so2CalcDate?: string;
    so2IndexLevel?: IndexLevel | null;
    so2SourceDataDate?: string;
    stIndexCrParam?: string;
    stIndexStatus?: boolean;
    stSourceDataDate?: string;
}



const ComponentB = () => {
    const [stationId, setStationId] = useState(null);
    const [airQualityData, setAirQualityData] = useState<AirQualityIndex | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<String | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStationId, setSelectedStationId] = useState(undefined);

    const getTagColor = (indexLevelName?: string): string => {
        switch (indexLevelName) {
            case 'Bardzo dobry':
                return 'green';
            case 'Dobry':
                return 'green';
            case 'Umiarkowany':
                return 'orange';
            case 'Dostateczny':
                return 'volcano';
            case 'Zły':
                return 'red';
            default:
                return 'gray';
        }
    };

    const renderDescriptionItem = (label: string, data: any, indexLevel?: IndexLevel | null) => {
        if (data) {
            return (
                <Descriptions.Item label={label}>
                    {indexLevel ?
                        <Tag color={getTagColor(indexLevel.indexLevelName)}>
                            {indexLevel.indexLevelName}
                        </Tag> : data
                    }
                </Descriptions.Item>
            );
        }
        return null;
    };

    useEffect(() => {
        const fetchStations = async () => {
            try {
                // Oczywiście adres URL powinien być dostosowany do Twojego środowiska
                const response = await fetch('http://159.69.183.243:3000/api/gios-data');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setStations(data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchStations();
    }, []);
    const fetchAirQualityData = async () => {
        if (!stationId) {
            setError("Proszę wybrać ID stacji.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://159.69.183.243:3000/api/air-quality-index/${stationId}`);
            if (!response.ok) {
                throw new Error('Problem z odpowiedzią serwera');
            }
            const data = await response.json();
            setAirQualityData(data);
        } catch (err: any) {
            setError(err.message);
            setAirQualityData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <Title level={3}>Indeksy zanieczyszczenia dla danej stacji</Title>
            <Select
                showSearch
                style={{ width: 200 }}
                // onSearch={fetchAirQualityData}
                placeholder="Wybierz ID stacji"
                optionFilterProp="children"
                notFoundContent={loading ? <Spin size="small" /> : null}
                onChange={(value) => setStationId(value)}
                filterOption={(input, option: any) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
            >
                {stations.map(station => (
                    <Option key={station.id} value={station.id}>{station.stationName}</Option>
                ))}
            </Select>
            <Button type="primary" onClick={fetchAirQualityData} disabled={!stationId}>
                Pobierz dane
            </Button>
            {loading && <Spin />}
            {error && <Alert message="Błąd" description={error} type="error" showIcon />}
            {airQualityData && (
                <div style={{ margin: 16 }}>

                    <Descriptions bordered size="small" column={1}>
                        {renderDescriptionItem("Ogólny stan powietrza", airQualityData.stIndexLevel?.indexLevelName, airQualityData.stIndexLevel)}
                        {renderDescriptionItem("NO2 - Indeks jakości", airQualityData.no2IndexLevel?.indexLevelName, airQualityData.no2IndexLevel)}
                        {renderDescriptionItem("O3 - Indeks jakości", airQualityData.o3IndexLevel?.indexLevelName, airQualityData.o3IndexLevel)}
                        {renderDescriptionItem("PM10 - Indeks jakości", airQualityData.pm10IndexLevel?.indexLevelName, airQualityData.pm10IndexLevel)}
                        {renderDescriptionItem("PM25 - Indeks jakości", airQualityData.pm25IndexLevel?.indexLevelName, airQualityData.pm25IndexLevel)}
                        {renderDescriptionItem("Data pomiaru", airQualityData.stCalcDate)}

                        {/* Dodaj więcej elementów w ten sposób */}
                    </Descriptions>
                </div>
            )}
        </div>
    );
};

export default ComponentB;

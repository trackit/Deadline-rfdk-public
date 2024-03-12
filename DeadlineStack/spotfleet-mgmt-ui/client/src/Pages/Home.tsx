import React, { useEffect, useState } from 'react';
import FleetForm from '../Components/FleetForm';
import Layout, { Content, Header } from 'antd/es/layout/layout';
import Switch from 'antd/es/switch';
import Flex from 'antd/es/flex';

const Home = () => {
    const [data, setData] = useState<{ [key: string]: any }>({});
    useEffect(() => {
        getData();
    }, []);

    const getData=()=>{
        fetch('/config_exemple.json'
        ,{
          headers : { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
           }
        }
        )
          .then(function(response){
            console.log(response)
            return response.json();
          })
          .then(function(myJson) {
            console.log(myJson);
            setData(myJson)
          });
      }

    return (
      <Layout className='container'>
        <Header
                style={{
                    backgroundColor: "white",
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center' 
                }}
            >
                <div>
                    <h1 style={{ margin: 0 }}>SFMT</h1> 
                </div>
                <Switch />
            </Header>
            <Layout>
            <Content style={{ padding: '0 50px', marginTop: 64,  backgroundColor: "white" }}> 
                <Flex vertical gap="default" style={{ width: '50%' }}> 
                {Object.entries(data).map(([key, value], index) => (
                            <div style={{ marginBottom: '6px' }} key={index}>
                                <FleetForm key={index} fleetData={data} fleetTitle={key}  />
                            </div>
                        ))}
                </Flex>
            </Content>
            </Layout>
      </Layout>
        
    );
};

export default Home;

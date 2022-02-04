/* pages/index.js */
import React, {useEffect, useState} from 'react'
import {ethers} from 'ethers'
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import {Button, FormControl, FormHelperText, FormLabel, Input, Textarea} from "@chakra-ui/react";

const ConnectWallet = () => {
  const [account, setAccount] = useState('')
  const [connection, setConnection] = useState(false)
  const [loggedIn, setLoggedIn] = useState(false)

  // const [rawProvider,setRawProvider]=useState(undefined);

  async function getWeb3Modal() {
    let Torus = (await import('@toruslabs/torus-embed')).default
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: false,
      providerOptions: {
        torus: {
          package: Torus
        },
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: 'your-infura-id'
          },
        },
      },
    })
    return web3Modal
  }

  async function connect() {
    const web3Modal = await getWeb3Modal()
    const connection = await web3Modal.connect()
    const rawProvider = connection;
    const provider = new ethers.providers.Web3Provider(connection)
    const accounts = await provider.listAccounts()
    rawProvider.on("accountsChanged", (accounts) => {
      console.log("Accounts changed")
      setTimeout(() => window.location.reload(), 1);
    });
    setConnection(connection)
    setAccount(accounts[0])
  }

  async function signIn() {
    const authData = await fetch(`/api/auth?address=${account}`)
    const user = await authData.json()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const signature = await signer.signMessage("Sign in with ethereum : " + user.nonce.toString())
    const response = await fetch(`/api/verify?address=${account}&signature=${signature}`)
    const data = await response.json()
    setLoggedIn(data.authenticated)
  }

  const sendData = async (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name")
    const discord = data.get("discord-id")
    const email = data.get("email")
    const location = data.get("location")
    const device = data.get("device");
    const os = data.get("os");
    const info = data.get("info");


    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const formData = {
      address: account,
      name: name,
      discord: discord,
      email: email,
      location: location,
      device: device,
      os: os,
      info: info,
    };
    const strData = JSON.stringify(formData)
    const signature = await signer.signMessage(strData)
    const response = await fetch("/api/data", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: account,
        signature: signature,
        formData: formData,
      })
    });
    const res = await response.json()
    if (res) {
      //TODO execute email
      console.log("Data sent");
    } else {
      //TODO error message
      console.log("nothing sent");
    }

  }

  const exportData = async () => {
    const response= await fetch(`/api/exportData`)
    const blob = await response.blob();
    var url = window.URL.createObjectURL(blob);
    window.open("/api/exportData","_blank");
    URL.revokeObjectURL("/api/exportData")
  }

  return (
    <div style={container}>
      {
        !connection && <button style={button} onClick={connect}> Connect Wallet</button>
      }
      {connection && !loggedIn && (
        <div>
          <button style={button} onClick={signIn}>Sign In</button>
        </div>
      )}
      {
        loggedIn && <div>
          <form onSubmit={sendData}>
            <FormControl id='name'>
              <FormLabel>Name</FormLabel>
              <Input type='text'
                     placeholder={"your name"}
                     name={"name"}
              />
              <FormHelperText>Your name</FormHelperText>
            </FormControl>
            <br/>
            <FormControl id='discord_id'>
              <FormLabel>Your discord id</FormLabel>
              <Input type='text'
                     placeholder={"discord id"}
                     name={"discord_id"}
              />
            </FormControl>
            <br/>
            <FormControl id='email'>
              <FormLabel>Your Email</FormLabel>
              <Input type='text'
                     placeholder={"example@example.com"}
                     name={"email"}

              />
            </FormControl>
            <FormControl id='location'>
              <FormLabel>Your location</FormLabel>
              <Input type='text'
                     placeholder={""}
                     name={"location"}

              />
            </FormControl>
            <FormControl id='device'>
              <FormLabel>Your device</FormLabel>
              <Input type='text'
                     placeholder={""}
                     name={"device"}

              />
            </FormControl>
            <FormControl id='os'>
              <FormLabel>Your OS version</FormLabel>
              <Input type='text'
                     placeholder={""}
                     name={"os"}

              />
            </FormControl>
            <FormControl id='info'>
              <FormLabel>Any additional information</FormLabel>
              <Textarea type='text'
                        placeholder={""}
                        name={"info"}

              />
            </FormControl>
            <Button
              mt={4}
              colorScheme='teal'
              type='submit'
            >
              Submit
            </Button>
          </form>
          <Button onClick={exportData}>Export Data</Button>
        </div>
      }

    </div>
  )
}

const container = {
  width: '900px',
  margin: '50px auto'
}

const button = {
  width: '100%',
  margin: '5px',
  padding: '20px',
  border: 'none',
  backgroundColor: 'black',
  color: 'white',
  fontSize: 16,
  cursor: 'pointer'
}

export default ConnectWallet
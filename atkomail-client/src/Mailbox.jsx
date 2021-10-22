import React, { useState, useEffect, useRef } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Icon, Container, List, Button, Dimmer, Loader,Image, Grid, GridColumn, Popup, Modal, Header, Divider } from 'semantic-ui-react';
import RefreshNotice from './RefreshNotice'
import ReactTimeAgo from 'react-time-ago'
import axios from 'axios'
import config from './config'
import './Mailbox.css'
import * as Sentry from "@sentry/react";
import useWebSocket from 'react-use-websocket';


const Mailbox = (props) => {

    const {oktaAuth } = useOktaAuth();
    const [messages,setMessages] = useState(null)
    const [open, setOpen] = React.useState(false)
    const didUnmount = useRef(false);
    const [showRefreshNotice, setShowRefreshNotice] = useState(false)

    const {sendMessage} = useWebSocket(
        'wss://notify.atko.email',
        {
            onMessage: (message) => {getMail()},
            //This line would authenticate the request but leaks AT on the wire
            //While socket carries only notification do not authenticate
            //queryParams: { id: oktaAuth.getAccessToken() },
            onError: (message) => { console.log(message) },
            shouldReconnect: (closeEvent) => { return didUnmount.current === false },
            reconnectAttempts: 10,
            reconnectInterval: 3000
        })
    

    const getMail = () => {
        axios.get(config.resourceServer.endpoint +"/mail/"+props.mailbox,
            { headers: { Authorization: "Bearer " + oktaAuth.getAccessToken() }}
        )
        .then((data)=>{ setMessages(data.data.messages) })
        .catch((error)=> { Sentry.captureException(error) })
    }
    
    const getMailbox = (e) => {
        setMessages(null)
        if(e){ e.preventDefault() }
        getMail()
      };
    
    const refreshMailbox = (e) => {
        setShowRefreshNotice(true)
        getMailbox()
    };
    
    const deleteMail = (e) => {
        axios.delete(config.resourceServer.endpoint +"/mail/"+e.target.id,
            { headers: { Authorization: "Bearer " + oktaAuth.getAccessToken() }}
        )
        .then((data)=>{ getMailbox() })
        .catch((error)=> { Sentry.captureException(error) })
    };

    const deleteMailbox = () => {
        axios.delete(config.resourceServer.endpoint +"/mail/"+props.mailbox,
            { headers: { Authorization: "Bearer " + oktaAuth.getAccessToken() }}
        )
        .then((data)=>{ getMailbox() })
        .catch((error)=> { Sentry.captureException(error) })
    };

    useEffect(() => {
        setMessages(null)
        didUnmount.current = true;
        if(props.mailbox){
            sendMessage(JSON.stringify({mailbox: props.mailbox}))
            axios.get(config.resourceServer.endpoint +"/mail/"+props.mailbox,
                { headers: { Authorization: "Bearer " + oktaAuth.getAccessToken() }}
            )
            .then((data)=>{ setMessages(data.data.messages) })
            .catch((error)=> { Sentry.captureException(error) })
        }
    }, [props.mailbox, props.domain, oktaAuth,sendMessage])


    useEffect(() => {
        return () => {
          console.log("cleaned up");
        };
      }, []);

    return (
        <Container>
        <RefreshNotice visible={showRefreshNotice}/>
        <Container padded>
            {messages ? (
                <Container>
                    <div>
                        <Popup 
                            content='Click to copy'
                            trigger={
                                <b className="address"
                                    onClick={()=>{
                                        navigator.clipboard.writeText(props.mailbox)
                                        }}
                                >{props.mailbox}</b>} />
                        &nbsp;has {messages.length} {messages.length === 1 ?(<span>message</span>):(<span>messages</span>)} 
                        <Button compact floated='right' onClick={refreshMailbox}><Icon link name="sync"></Icon>Refresh</Button>
                                
                        {messages.length !== 0 && <Modal
                            basic
                            onClose={() => setOpen(false)}
                            onOpen={() => setOpen(true)}
                            open={open}
                            size='small'
                            trigger={ <Button compact floated='right'><Icon link name="trash"></Icon>Delete all</Button>}
                            >
                            <Header icon>
                                <Icon name='trash' />
                                Delete all messages
                            </Header>
                            <Modal.Content>
                                This will delete all messages in this inbox would you like to continue?
                            </Modal.Content>
                            <Modal.Actions>
                                <Button color='red' inverted onClick={() => setOpen(false)}>
                                <Icon name='remove' /> No
                                </Button>
                                <Button color='green' inverted onClick={() => {setOpen(false); deleteMailbox()}}>
                                <Icon name='checkmark' /> Yes
                                </Button>
                            </Modal.Actions>
                        </Modal>}
                    </div>
                    <Divider hidden />
                    <List divided relaxed>
                    {messages.length !== 0 ? (
                        messages.map((msg) =>
                            <List.Item key={msg.id} >

                            <Image src={msg.avatar} avatar size='mini'/>   
                            <List.Content>
                                <List.Header as='a' onClick={props.getMailEvent} id={msg.id} >{msg.subject}</List.Header>
                                <List.Description as='a' onClick={props.getMailEvent} id={msg.id}>{msg.from.value[0].name} ({msg.from.value[0].address})</List.Description>
                                <List.Description as='a' onClick={props.getMailEvent} id={msg.id}><ReactTimeAgo date={msg.date} locale="en-US"/></List.Description>
                            </List.Content>
                            <List.Content floated='right' className="actions">
                                <List.Icon verticalAlign='middle'>
                                    <Button onClick={deleteMail} id={msg.id} color='red'><Icon color='white' fitted name='trash'></Icon></Button>
                                </List.Icon>
                            </List.Content>
                            
                            </List.Item> 
                        ))
                        :
                        (                           
                            <Grid columns={2} divided>
                            <Grid.Row>
                                <GridColumn textAlign='center' width={2}><Icon name="paper plane outline" size='huge'/></GridColumn>
                                <GridColumn>
                                    <p>This inbox is currently empty.</p>
                                    <p>Have an email sent to (<Popup content='Click to copy' trigger={<b className="address" onClick={()=>{navigator.clipboard.writeText(props.mailbox)}}>{props.mailbox}</b>} />) or any inbox you want above to view it here for up to 24 hours.</p>
                                </GridColumn>                               
                            </Grid.Row>
                            </Grid>
                        )}
                    </List>
                </Container>
            ) : (
                <Container padded>
                      <Dimmer active inverted>
        <Loader inverted>Loading</Loader>
      </Dimmer>
            </Container>
            )
            }
        </Container>
        </Container>
    )
}
export default Mailbox;
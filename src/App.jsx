import React, { useState } from "react";
import Header from "./components/Header";
import '../src/style.scss'
import Main from "./components/Main";
import Footer from "./components/Footer";
import Overlay from './overlays/Overlay'
import { InMemoryCache, HttpLink, ApolloClient } from '@apollo/client'
import { ApolloProvider } from "@apollo/client/react";
import { API_BASE_URL } from './config/api'

// Create HTTP Link
const httpLink = new HttpLink({
  uri: `${API_BASE_URL}/graphql`,
});

// Apollo client with link
const client = new ApolloClient({
  link: httpLink,  // Add this
  cache: new InMemoryCache(),
});





function App() {
  const [stateOfOverlay, setStateOfOverlay] = useState(false)
  const body = document.querySelector('body')

  const receiveState = (receivedState) => setStateOfOverlay(receivedState)

  if (stateOfOverlay) {
    body.classList.add('overflow__hidden')
  } else {
    body.classList.remove('overflow__hidden')
  }

  return (
    <>
      <ApolloProvider client={client}>
        <Header overlayState={receiveState}  />
        <Main />
        <Footer />
        <Overlay currentState={stateOfOverlay} overlayState={receiveState} overlayType='login'/>
      </ApolloProvider>
    </>
  );
}

export default App;

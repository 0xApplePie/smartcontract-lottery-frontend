import { type AppType } from "next/dist/shared/lib/utils";
import { MoralisProvider } from "react-moralis";
import { NotificationProvider } from "web3uikit"

import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <MoralisProvider initializeOnMount={false}>
        <NotificationProvider>
            <Component {...pageProps} />
        </NotificationProvider>
    </MoralisProvider>
)
};

export default MyApp;

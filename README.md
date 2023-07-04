# NiftQuery

A project submission for the Moonbeam Bear Necesseties Hackathon; SubQuery challenge

[Demo Video](https://vimeo.com/842324527)

NiftyQuery is a meticulously designed and highly detailed ERC721 Non-Fungible Token (NFT) standard indexer. This exceptional indexer is capable of efficiently indexing NFTs across various prominent blockchains, including Astar, Moonbeam, Moonriver, and Shidden. To achieve this remarkable feat, we leverage the powerful SubQuery multi-chain indexing solution, which enables seamless indexing across multiple blockchains simultaneously. The primary objective of this indexer is to provide a unified and streamlined experience for users by exposing a single, all-encompassing GraphQL API that facilitates querying across these diverse blockchains.

At the heart of this indexer lies its ability to index ERC721 NFTs, a widely adopted standard for representing unique and indivisible digital assets on blockchain networks. By employing this standard, our indexer ensures compatibility and interoperability across different blockchains, making it an ideal solution for users seeking to explore NFTs across multiple ecosystems.

The first blockchain in our indexing repertoire is Astar, a cutting-edge blockchain platform renowned for its scalability and developer-friendly environment. With our indexer, Astar's NFT ecosystem becomes effortlessly accessible, enabling users to explore, query, and analyze a plethora of unique assets securely stored on this blockchain.

Moving on, we seamlessly integrate with Moonbeam, a highly compatible Ethereum Virtual Machine (EVM) implementation on Polkadot, to extend our indexing capabilities to this blockchain. Moonbeam's bridge to Ethereum allows for easy migration of existing Ethereum-based NFTs, while also providing a vibrant ecosystem of its own. Our indexer empowers users to dive into Moonbeam's NFT landscape with unparalleled ease.

Additionally, our indexer extends its reach to Moonriver, an essential network within the Moonbeam ecosystem. By supporting Moonriver, we ensure that users have access to a wide array of NFTs residing on this blockchain, enjoying the same level of functionality and convenience as with any other supported blockchain.

Furthermore, we encompass Shidden, a blockchain platform renowned for its unique privacy and anonymity features. Our indexer enables users to navigate the world of Shidden NFTs with remarkable precision, uncovering hidden treasures while preserving the utmost privacy of participants.

To achieve the formidable task of indexing NFTs across these diverse blockchains, we leverage the powerful SubQuery multi-chain indexing solution. SubQuery's robust infrastructure allows us to synchronize, parse, and organize NFT-related data from each blockchain, ensuring a comprehensive and accurate indexing process. By harnessing the capabilities of SubQuery, we can seamlessly handle the complexity of multiple blockchains while maintaining optimal performance and reliability.

Finally, our indexer takes pride in its ability to expose a unified GraphQL API, simplifying the querying process for users across all supported blockchains. GraphQL provides a flexible and efficient means of requesting specific data, allowing users to tailor their queries to their precise requirements. With our unified API, users can seamlessly search for NFTs, retrieve detailed information, and perform complex analyses across Astar, Moonbeam, Moonriver, and Shidden—all through a single entry point.

In conclusion, our ERC721 NFT standard indexer represents an extraordinary achievement in the field of blockchain indexing. By leveraging the power of SubQuery's multi-chain indexing solution, we seamlessly navigate the NFT ecosystems of Astar, Moonbeam, Moonriver, and Shidden. Through our meticulously designed GraphQL API, users gain unparalleled access to a vast array of NFTs across these blockchains, revolutionizing the way they explore, interact with, and analyze unique digital assets.

## Challenges We faced

Several prominent NFT marketplaces on various blockchains lack public APIs and instead rely on off-chain NFT listing mechanisms. Consequently, it becomes challenging to obtain a list of items available for sale. However, many of these marketplaces do emit on-chain events whenever a sale occurs. By leveraging these events, it becomes possible to calculate the floor price of a collection. Currently, our platform exclusively supports two NFT marketplaces: TofuNft and Moonbeans. However, our future plans involve expanding our support to include additional marketplaces that offer a public ABI interface.

## Getting started

To get a local copy up and running, follow below steps;

1. Clone the repository using the following command:

```sh
git clone https://github.com/iphyman/nifty-query
```

2. Change your directory to the root project:

```sh
cd nifty-query
```

3. Install the project dependencies using yarn:

```sh
yarn
```

4. Generate schema types and build:

```sh
yarn codegen && yarn build
```

5. Pull the required Docker images and start the containers using Docker Compose:

```sh
docker compose pull && docker compose up
```

After successfully following the previous steps, assuming everything proceeds as expected, the indexer should be operational. It will begin extracting NFT data from the blockchain and serving requests via the GraphQL Playground on port 3000.

## Sample Queries

Nfts

```graphQl
query {
  nfts(first: 20) {
    nodes {
      name
      tokenId
      description
      image
      uri
      metadata
      network
      owner {
        id
      }
      collection {
        name
        symbol
        floorPrice
      }
    }
  }
}
```

Collections

```graphQl
query {
  collections(first: 20) {
    nodes {
      id
      name
      symbol
      network
      floorPrice
    }
  }
}
```

Accounts

```graphQl
query {
  accounts(first: 20) {
    nodes {
      nftsByOwnerId {
        nodes {
          name
          description
          uri
          tokenId
          network
        }
      }
    }
  }
}
```

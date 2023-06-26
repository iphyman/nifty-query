import { Metadata, Network } from "../../types";
import { TransferLog } from "../../types/abi-interfaces/Erc721Abi";
import { Erc721Abi__factory } from "../../types/contracts";
import { Account, Collection, Nft } from "../../types/models";

function decodeURL(url: string) {
  const protocol = url.split(":")[0].toLowerCase();

  switch (protocol) {
    case "data":
      return { protocol, url };
    case "https":
      return { protocol, url };
    case "http":
      return { protocol, url: "https" + url.substring(0, 4) };
    case "ipfs": {
      const hash = url.match(/^ipfs:(\/\/)?(.*)$/i)?.[2];
      return {
        protocol,
        url: `https://ipfs.io/ipfs/${hash}/`,
      };
    }
    case "ipns": {
      const name = url.match(/^ipns:(\/\/)?(.*)$/i)?.[2];
      return {
        protocol,
        url: `https://cloudflare-ipfs.com/ipns/${name}/`,
      };
    }
    case "ar": {
      const hash = url.match(/^ar:(\/\/)?(.*)$/i)?.[2];
      return { protocol, url: `https://arweave.net/${hash}` };
    }
    default: {
      return { protocol, url };
    }
  }
}

async function decodeTokenURI(tokenURI: string) {
  const { url } = decodeURL(tokenURI);

  const resp = await fetch(url);
  const data = await resp.json();

  if (!data) return null;

  const { url: image } = decodeURL(data.image);
  const metadata: Metadata = {
    name: data.name,
    description: data.description,
    external_url: data.external_url ?? "",
    image,
    attributes: data.attributes,
  };

  return metadata;
}

export async function getCollection(address: string, network: Network) {
  const id = [network, address].join("-");
  let collection = await Collection.get(id);

  if (collection != null) {
    return collection;
  }

  const contract = Erc721Abi__factory.connect(address, api);
  const name = (await contract.name()) ?? "";
  const symbol = (await contract.symbol()) ?? "";

  collection = Collection.create({
    id,
    network,
    contractAddress: address,
    name,
    symbol,
    floorPrice: 0,
  });

  await collection.save();
  return collection;
}

export async function getNft(network: Network, event: TransferLog) {
  const id = [network, event.address, event.args!.tokenId.toString()].join("-");
  let nft = await Nft.get(id);

  if (nft != null) {
    return nft;
  }

  const owner = await getAccount(network, event.args!.to);
  const contract = Erc721Abi__factory.connect(event.address, api);
  const tokenURI = await contract.tokenURI(event.args!.tokenId);
  const metadata = await decodeTokenURI(tokenURI);

  nft = Nft.create({
    id,
    network,
    tokenId: event.args!.tokenId.toBigInt(),
    collectionId: event.address,
    block: BigInt(event.blockNumber),
    timestamp: parseInt(event.block.timestamp.toString()),
    ownerId: owner.id,
    uri: tokenURI,
    name: metadata?.name,
    description: metadata?.description,
    image: metadata?.image,
    ...(metadata ? metadata : null),
  });

  await nft.save();
  return nft;
}

export async function getAccount(network: Network, address: string) {
  const id = [network, address].join("-");
  let account = await Account.get(id);

  if (account != null) {
    return account;
  }

  account = Account.create({
    id,
    address,
    network,
  });

  await account.save();
  return account;
}

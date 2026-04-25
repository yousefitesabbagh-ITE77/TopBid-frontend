import { apiRequest } from "./api";

async function placeBid({ auctionId, amount }) {
  return apiRequest("/bids", {
    method: "POST",
    body: {
      auction_id: auctionId,
      amount,
    },
  });
}

export { placeBid };
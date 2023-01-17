import User from "../models/user"
import Stripe from "stripe"
const queryString = require('querystring');

const stripe= new Stripe(process.env.STRIPE_SECRET)
export const createConnectAccount=async(req, res, ) =>{
console.log("sign in is required",req.auth);
// find user from db
const user =await User.findById(req.auth._id).exec()
console.log("user====>",user)
// if user dont have stripe_account_id yet, create new
if(!user.stripe_account_id){
    const account =await stripe.accounts.create({
        type:'express',
    })
    console.log("Account===>",account);
    user.stripe_account_id=account.id
    user.save()
}
// create account link based on account id(for frontend to complete onboarding)
let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    return_url: process.env.STRIPE_REDIRECT_URL,
    type: "account_onboarding",
  });
  // prefill any info such as email
  accountLink = Object.assign(accountLink, {
    "stripe_user[email]": user.email || undefined,
  });
  let link=`${accountLink.url}?${queryString(accountLink)}`
  res.send(link)
// update payment schedule(olptional.default is 2 days)


}

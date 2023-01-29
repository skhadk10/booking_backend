import User from "../models/user";
import Stripe from "stripe";
const queryString = require("querystring");

const stripe = new Stripe(process.env.STRIPE_SECRET);
export const createConnectAccount = async (req, res) => {
  console.log("sign in is required", req.auth);
  // find user from db
  const user = await User.findById(req.auth._id).exec();
  console.log("user====>", user);
  // if user dont have stripe_account_id yet, create new
  if (!user.stripe_account_id) {
    const account = await stripe.accounts.create({
      type: "express",
    });
    console.log("Account===>", account);
    user.stripe_account_id = account.id;
    user.save();
  }
  // // create account link based on account id(for frontend to complete onboarding)
  let accountLink = await stripe.accountLinks.create({
    account: user.stripe_account_id,
    refresh_url: process.env.STRIPE_REDIRECT_URL,
    return_url: process.env.STRIPE_REDIRECT_URL,
    type: "account_onboarding",
  });
  //   // prefill any info such as email
  accountLink = Object.assign(accountLink, {
    "stripe_user[email]": user.email || undefined,
  });
  console.log(accountLink, "account linked");

  let link = `${accountLink.url}?${queryString.stringify(accountLink)}`;
  console.log(link, "linked");
  res.send(link);
  // update payment schedule(olptional.default is 2 days)
};

const updateDelayDays = async (accountId) => {
  const account = await stripe.accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          delay_days: 7,
        },
      },
    },
  });
  return account;
};

export const getAccountStatus = async (req, res) => {
  // console.log('get account status')
  const user = await User.findById(req.auth._id).exec();
  const account = await stripe.accounts.retrieve(user.stripe_account_id);
  // console.log(account,"user account retrive");
  // update delay days
  const updatedAccount = await updateDelayDays(account.id);
  const updatedUser = await User.findByIdAndUpdate(
    user._id,
    { stripe_seller: updatedAccount },
    { new: true }
  )
    .select("-password")
    .exec();
  // console.log(updatedUser,"updated");
  res.json(updatedUser);
};

export const getAccountBalance = async (req, res) => {
  const user = await User.findById(req.auth._id).exec();
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: user.stripe_account_id,
    });
    // console.log("Balance: ",balance)
    res.json(balance);
  } catch (err) {
    console.log(err);
  }
};
export const payoutSetting = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).exec();
    const loginLink = await stripe.accounts.createLoginLink(
      user.stripe_account_id,
      {
        redirect_url: process.env.STRIPE_SETTING_REDIRECT_URL,
      }
    );
    // console.log("stripe payout setting: ", loginLink);
    res.json(loginLink);
  } catch (err) {
    console.log("stripe payment setting err",err);
  }
};

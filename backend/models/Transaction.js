import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  title:{type:String,required:true,trim:true},
  amount:{type:Number,required:true,min:0.01},
  type:{type:String,enum:['income','expense','transfer'],required:true},
  category:{type:String,required:true},
  paymentMethod:{type:String,default:'Cash'},
  date:{type:Date,default:Date.now},
  description:{type:String,default:''}
},{timestamps:true});
export default mongoose.model('Transaction',schema);

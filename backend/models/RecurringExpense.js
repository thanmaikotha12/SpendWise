import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true,index:true},
  title:{type:String,required:true}, amount:{type:Number,required:true,min:0.01},
  category:{type:String,required:true}, frequency:{type:String,enum:['daily','weekly','monthly','yearly'],default:'monthly'},
  nextDueDate:{type:Date,required:true}, paymentMethod:{type:String,default:'Auto Debit'}, active:{type:Boolean,default:true}
},{timestamps:true});
export default mongoose.model('RecurringExpense',schema);

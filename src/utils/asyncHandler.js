const asyncHandler=(asyncfunction)=>{
  return  (req,res,next)=>{
        Promise.resolve(asyncfunction(req,res,next)).catch
             ((err)=> next(err))
    }
}

export {asyncHandler}
// const asyncHandler=(fn)=> async (req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code).json({
//             suceess:false,
//             message:err.message
//         })
//     }
// }

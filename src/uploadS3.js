import Amplify, { Auth, Storage } from 'aws-amplify';


// Amplify.configure({
//     Auth: {
//         identityPoolId: 'us-east-1:632fe465-4c6b-49a7-bcb0-ddc9cf0e16ee', //REQUIRED - Amazon Cognito Identity Pool ID
//         region: 'us-east-1', // REQUIRED - Amazon Cognito Region
//         // userPoolId: 'XX-XXXX-X_abcd1234', //OPsudo TIONAL - Amazon Cognito User Pool ID
//         // userPoolWebClientId: 'XX-XXXX-X_abcd1234', //OPTIONAL - Amazon Cognito Web Client ID
//     },
//     Storage: {
//         AWSS3: {
//             bucket: 'ac-datamatics', //REQUIRED -  Amazon S3 bucket name
//             region: 'us-east-1', //OPTIONAL -  Amazon service region
//         }
//     }
// });

// export async function uploadFile(props){
//     await Storage.put(new Date().toJSON(), props.blob);
//     console.log('uploaded');
// }

export async function uploadVideo(blob) {
    try {
      //const response = await fetch(uploadVideo);
      //const blob = await response.blob();
      await Storage.put(new Date().toJSON() + ".webm", blob, {
        contentType: "video/webm", // contentType is optional
      });
      console.log("Uploaded");
    } catch (err) {
      console.log("Error uploading file:", err);
    }
  }
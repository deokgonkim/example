	
FROM public.ecr.aws/lambda/nodejs:12-x86_64
 
COPY node.js ./
 
# You can overwrite command in `serverless.yml` template
CMD ["node.handler"]

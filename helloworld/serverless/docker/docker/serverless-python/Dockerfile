	
FROM public.ecr.aws/lambda/python:3.8-x86_64
 
COPY python.py ./
 
# You can overwrite command in `serverless.yml` template
CMD ["python.handler"]

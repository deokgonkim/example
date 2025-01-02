import grpc

# from . import helloworld_pb2
# from . import helloworld_pb2_grpc
import helloworld_pb2
import helloworld_pb2_grpc

def client(target, name):
    channel = grpc.insecure_channel(target)
    stub = helloworld_pb2_grpc.HelloStub(channel)
    response = stub.hello(helloworld_pb2.HelloRequest(name=name))
    print("Hello client received: " + response.message)
    return response

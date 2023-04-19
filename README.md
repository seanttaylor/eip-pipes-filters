# eip-pipes-filters
An exploration of the Pipes &amp; Filters pattern from [Enterprise Integration Patterns](https://tinyurl.com/ye2tuub2)

## Introduction

The Pipes and Filters pattern answers the following design prompt:
> How can we perform complex processing on a message while maintaining independence and flexibility?

The answer is embodied in this architecture: 

> "...divide a larger processing task into a sequence of smaller, independent processing steps (Filters) that are connected by channels (Pipes)." - Enterpise Integration Patterns

## Pattern Summary

Each filter exposes a simple interface: it receives messages on the inbound pipe, processes the message, and publishes the results to the outbound pipe. The pipe connects one filter to the next, sending output messages from one filter to the next. Because all components use the same external interface they can be composed into different solutions by connecting the components to different pipes. We can add new filters, omit existing ones or rearrange them into a new sequence -- all without having to change the filters themselves. The connection between filter and pipe is sometimes called port. In this basic form, each filter component has one input port and one output port.

## Implementation Diagram

![My implementation](https://github.com/seanttaylor/eip-pipes-filters/blob/4746ba9eb9adb758e69f3d45a288aaca01c769dd/docs/ice-cream-pipeline-diagram.png)


## Implementation Summary

We take a store records containing information about various ice cream flavors and process them via a set of specified filters namely:
  * Decrypt
    * This filter decrypts messages that have been encrypted an placed onto the pipe by the Root node. The Decrypt filter uses a hardcoded shared secret to execute the decryption.
  * Authorize
    * This filter uses authorization information embedded in the message itself to determine whether the user associated with the specified ice cream message can perform a domain operation called `ice_cream.create`. If the user associated with the message has appropriate permissions the message is passed on the the next filter, if not the message is tossed. We could conceivably route unauthorized `ice_cream.create` messages to Dead Letter Queue (in essence) just another pipe, for further analysis.
  * Dedupe
    * This filter protects against duplicate messages propagating down the pipeline. The Root node randomly duplicates the messages it places on the pipeline. The Dedupe filter contains an in-memory cache, which could be a full blown Redis cluster or a database, that records the `eventId` of every message it processes. If a specified `eventId` exists in the cache, the message associated with this `eventId` is tossed.
  * Commit
    * This filer commits the incoming messages to a MongoDB instance and is the end of the pipeline

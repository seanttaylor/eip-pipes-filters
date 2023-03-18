# eip-pipes-filters
An exploration of the Pipes &amp; Filters pattern from [Enterprise Integration Patterns](https://tinyurl.com/ye2tuub2)

## Introduction

The Pipes and Filters pattern answers the following design prompt:
> How can we perform complex processing on a message while maintaining independence and flexibility?

The answer is embodied in this architecture: 

> "...divide a larger processing task into a sequence of smaller, independent processing steps (Filters) that are connected by channels (Pipes)." - Enterpise Integration Patterns

## Pattern Summary

Each filter exposes a very simple interface: it receives messages on the inbound pipe, processes the message, and publishes the results to the outbound pipe. The pipe connects one filter to the next, sending output messages from one filter to the next. Because all component use the same external interface they can be composed into different solutions by connecting the components to different pipes. We can add new filters, omit existing ones or rearrange them into a new sequence -- all without having to change the filters themselves. The connection between filter and pipe is sometimes called port. In the basic form, each filter component has one input port and one output port.
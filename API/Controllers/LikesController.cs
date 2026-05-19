using System;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

public class LikesController(IUnitOfWork uow) : BaseApiController
{
    [HttpPost("{targetMemberID}")]
    public async Task<ActionResult> ToggleLikes(string targetMemberID)
    {
        var sourceMemberID = User.GetMemberId();

        if (sourceMemberID == targetMemberID) return BadRequest("You cannot like yourself");

        var existingLike = await uow.LikesRepository.GetMemberLike(sourceMemberID, targetMemberID);

        if (existingLike == null)
        {
            var like = new MemberLike
            {
                SourceMemberId = sourceMemberID,
                TargetMemberId = targetMemberID
            };

            uow.LikesRepository.AddLike(like);
        }
        else
        {
            uow.LikesRepository.DeleteLike(existingLike);
        }

        if (await uow.Complete()) return Ok();

        return BadRequest("Failed to update like");
    }

    [HttpGet("list")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetCurrentMemberLikeIds()
    {
        return Ok(await uow.LikesRepository.GetCurrentMemberLikeIds(User.GetMemberId()));
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Member>>> GetMemberLikes([FromQuery] LikesParams likesParams)
    {
        likesParams.MemberId = User.GetMemberId();

        var members = await uow.LikesRepository.GetMemberLikes(likesParams);

        return Ok(members);
    }
}

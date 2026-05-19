using System;
using API.Entities;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers;

public class AdminController(UserManager<AppUser> userManager, IUnitOfWork uow, IPhotoService photoService) : BaseApiController
{
    [Authorize(Policy = "RequireAdminRole")]
    [HttpGet("users-with-roles")]
    public async Task<ActionResult> GetUsersWithRoles()
    {
        var users = await userManager.Users.ToListAsync();
        var userList = new List<object>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            userList.Add(new
            {
                user.Id,
                user.Email,
                Roles = roles.ToList()
            });
        }
        return Ok(userList);
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpGet("photos-to-moderate")]
    public async Task<IActionResult> GetPhotosToModeration()
    {
        return Ok(await uow.PhotosRepository.GetUnapprovedPhotos());
    }

    [Authorize(Policy = "RequireAdminRole")]
    [HttpPost("edit-roles/{userId}")]
    public async Task<ActionResult<IList<string>>> EditRoles(string userId, [FromQuery] string roles)
    {
        if (string.IsNullOrEmpty(roles))
        {
            return BadRequest("Atleast one role must be selected");
        }

        var selectedRoles = roles.Split(',').ToArray();

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            return NotFound("User not found");
        }

        var currentRoles = await userManager.GetRolesAsync(user);

        var result = await userManager.AddToRolesAsync(user, selectedRoles.Except(currentRoles));
        if (!result.Succeeded)
        {
            return BadRequest("Failed to add user to roles");
        }

        result = await userManager.RemoveFromRolesAsync(user, currentRoles.Except(selectedRoles));
        if (!result.Succeeded)
        {
            return BadRequest("Failed to remove user from roles");
        }

        return Ok(await userManager.GetRolesAsync(user));
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpPost("approve-photo/{photoId}")]
    public async Task<ActionResult> ApprovePhoto(int photoId)
    {
        var photo = await uow.PhotosRepository.GetPhotoById(photoId);
        if (photo == null) return BadRequest("Could not get the photo from database");
        var member = await uow.MemberRepository.GetMemberForUpdate(photo.MemberId);
        if (member == null) return BadRequest("Member not found");
        photo.IsApproved = true;
        if (member.ImageUrl == null)
        {
            member.ImageUrl = photo.Url;
            member.AppUser.ImageUrl = photo.Url;
        }
        await uow.Complete();
        return Ok();
    }

    [Authorize(Policy = "ModeratePhotoRole")]
    [HttpPost("reject-photo/{photoId}")]
    public async Task<ActionResult> RejectPhoto(int photoId)
    {
        var photo = await uow.PhotosRepository.GetPhotoById(photoId);
        if (photo == null) return BadRequest("Could not get the photo from database");
        if (photo.PublicId != null)
        {
            var result = await photoService.DeletePhotoAsync(photo.PublicId);
            if (result.Result == "ok")
            {
                uow.PhotosRepository.RemovePhoto(photo);
            }
        }
        else
        {
            uow.PhotosRepository.RemovePhoto(photo);
        }
        await uow.Complete();
        return Ok();
    }
}

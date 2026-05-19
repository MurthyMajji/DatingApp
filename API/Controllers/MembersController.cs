using System.Security.Claims;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    public class MembersController(IUnitOfWork uow, IPhotoService photoService) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<IReadOnlyList<Member>>> GetMembers([FromQuery] MemberParams memberParams)
        {
            memberParams.CurrentMemberId = User.GetMemberId();

            return Ok(await uow.MemberRepository.GetMembersAsync(memberParams));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Member>> GetMember(string id)
        {
            var member = await uow.MemberRepository.GetMemberByIdAsync(id);

            if (member == null)
            {
                return NotFound();
            }

            return member;
        }

        [HttpGet("{id}/photos")]
        public async Task<ActionResult<IReadOnlyList<Photo>>> GetMemberPhotos(string id)
        {
            var isCurrentUser = User.GetMemberId() == id;

            return Ok(await uow.MemberRepository.GetPhotosForMemberAsync(id, isCurrentUser));
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMember(string id, MemberUpdateDto memberUpdateDto)
        {
            var member = await uow.MemberRepository.GetMemberForUpdate(id);

            if (member == null) return BadRequest("User not found");

            member.DisplayName = memberUpdateDto.DisplayName ?? member.DisplayName;
            member.Description = memberUpdateDto.Description ?? member.Description;
            member.City = memberUpdateDto.City ?? member.City;
            member.Country = memberUpdateDto.Country ?? member.Country;

            member.AppUser.DisplayName = memberUpdateDto.DisplayName ?? member.AppUser.DisplayName;

            uow.MemberRepository.Update(member);

            if (await uow.Complete()) return NoContent();

            return BadRequest("Failed to update user");
        }

        [HttpPost("add-photo")]
        public async Task<ActionResult<Photo>> UploadPhoto([FromForm] IFormFile file)
        {
            var member = await uow.MemberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("User not found");

            var uploadResult = await photoService.UploadPhotoAsync(file);

            if (uploadResult.Error != null) return BadRequest(uploadResult.Error.Message);

            var photo = new Photo
            {
                Url = uploadResult.SecureUrl.AbsoluteUri.ToString(),
                PublicId = uploadResult.PublicId,
                MemberId = User.GetMemberId(),
            };

            ///Should not be added as a profile image till photo gets approved
            // if (member.ImageUrl == null)
            // {
            //     member.ImageUrl = photo.Url;
            //     member.AppUser.ImageUrl = photo.Url;
            // }

            member.Photos.Add(photo);

            if (await uow.Complete()) return photo;

            return BadRequest("Failed to upload photo");
        }

        [HttpPut("set-main-photo/{photoId}")]
        public async Task<IActionResult> SetMainPhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("User not found");

            var photo = member.Photos.SingleOrDefault(p => p.Id == photoId);

            if (photo == null) return BadRequest("Photo not found");

            if (photo.Url == member.ImageUrl) return BadRequest("This is already your main photo");

            if (photo.MemberId != User.GetMemberId()) return BadRequest("Unauthorized to modify this photo");

            member.ImageUrl = photo.Url;
            member.AppUser.ImageUrl = photo.Url;

            if (await uow.Complete()) return NoContent();

            return BadRequest("Failed to set main photo");
        }

        [HttpDelete("delete-photo/{photoId}")]
        public async Task<IActionResult> DeletePhoto(int photoId)
        {
            var member = await uow.MemberRepository.GetMemberForUpdate(User.GetMemberId());

            if (member == null) return BadRequest("User not found");

            var photo = member.Photos.SingleOrDefault(p => p.Id == photoId);

            if (member.Photos != null)
            {
                Console.WriteLine($"Total photos in collection: {member.Photos.Count}");
                foreach (var p in member.Photos)
                {
                    Console.WriteLine($"-> Available Photo ID in memory: {p.Id}");
                }
            }

            if (photo == null) return BadRequest("Photo not found");

            if (photo.Url == member.ImageUrl) return BadRequest("Cannot delete main photo");

            if (photo.MemberId != User.GetMemberId()) return BadRequest("Unauthorized to modify this photo");

            if (photo.PublicId != null)
            {
                var result = await photoService.DeletePhotoAsync(photo.PublicId);
                if (result.Error != null) return BadRequest(result.Error.Message);
            }

            member.Photos.Remove(photo);

            if (await uow.Complete()) return Ok();

            return BadRequest("Failed to delete photo");
        }
    }
}
